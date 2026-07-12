import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';
import logger from '../config/logger';

const esClient = new Client({ node: env.ELASTICSEARCH_URL });

// The ES client error carries its entire internal connection/socket state as
// enumerable properties — logging it raw dumps all of that. Log/rethrow a
// clean summary instead.
const logAndWrap = (err: unknown, context: Record<string, unknown>, message: string): Error => {
  const cleanMessage = err instanceof Error ? err.message : 'Unknown Elasticsearch error';
  logger.error({ ...context, message: cleanMessage }, message);
  return new Error(`${message}: ${cleanMessage}`);
};

const isNotFound = (err: unknown): boolean =>
  (err as { meta?: { statusCode?: number } })?.meta?.statusCode === 404;

const isIndexAlreadyExists = (err: unknown): boolean =>
  (err as { meta?: { body?: { error?: { type?: string } } } })?.meta?.body?.error?.type ===
  'resource_already_exists_exception';

/**
 * Thin, index-agnostic wrapper around the ES client. Nothing in here knows
 * about tickets or any other domain model — callers (the mongoose plugin)
 * supply the index name and document shape.
 */
const elasticService = {
  async ensureIndex(index: string, mappings?: Record<string, unknown>): Promise<void> {
    try {
      const { body: exists } = await esClient.indices.exists({ index });
      if (!exists) {
        await esClient.indices.create({ index, body: mappings ? { mappings } : undefined });
        logger.info({ index }, 'Created Elasticsearch index');
      }
    } catch (err) {
      // Benign check-then-create race: fine when multiple API replicas boot
      // at once and all try to create the same index.
      if (isIndexAlreadyExists(err)) return;
      // Startup should never crash just because ES isn't reachable yet; the
      // index will simply get created lazily the first time a write hits it.
      logAndWrap(err, { index }, 'Error ensuring Elasticsearch index exists');
    }
  },

  async index(index: string, id: string, document: Record<string, unknown>) {
    try {
      return await esClient.index({ index, id, body: document });
    } catch (err) {
      throw logAndWrap(err, { index, id }, 'Error indexing document');
    }
  },

  async update(index: string, id: string, doc: Record<string, unknown>) {
    try {
      return await esClient.update({ index, id, body: { doc } });
    } catch (err) {
      throw logAndWrap(err, { index, id }, 'Error updating document');
    }
  },

  async delete(index: string, id: string) {
    try {
      return await esClient.delete({ index, id });
    } catch (err) {
      if (isNotFound(err)) return; // nothing to delete, e.g. it was never indexed
      throw logAndWrap(err, { index, id }, 'Error deleting document');
    }
  },

  async search(index: string, query: Record<string, unknown>, from = 0, size = 20) {
    try {
      const { body } = await esClient.search({ index, from, size, body: { query } });
      return body.hits.hits.map((hit: { _source: unknown }) => hit._source);
    } catch (err) {
      throw logAndWrap(err, { index }, 'Error searching documents');
    }
  },
};

export default elasticService;
