import fs from 'fs';
import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';
import logger from '../config/logger';

// Initialize Elasticsearch client
const esClient = new Client({
  node: env.ELASTICSEARCH_URL,
  auth: {
    username: env.ELASTIC_USERNAME,
    password: env.ELASTIC_PASSWORD,
  },
  tls: {
    ca: fs.readFileSync(env.ELASTIC_CA_PATH),
    rejectUnauthorized: false, // Only for development, disable in production
  },
});

// The ES client error carries its entire internal connection/socket state
// (including the TLS cert bytes) as enumerable properties — logging it raw
// dumps all of that. Log/rethrow a clean summary instead.
const logAndCleanError = (err: unknown, context: Record<string, unknown>, message: string): Error => {
  const cleanMessage = err instanceof Error ? err.message : 'Unknown Elasticsearch error';
  logger.error({ ...context, message: cleanMessage }, message);
  return new Error(`${message}: ${cleanMessage}`);
};

// Elasticsearch service methods
const elasticService = {
  async indexDocument(index: string, id: string, body: Record<string, unknown>) {
    try {
      return await esClient.index({ index, id, body });
    } catch (err) {
      throw logAndCleanError(err, { index, id }, 'Error indexing document');
    }
  },

  async searchDocuments(index: string, query: Record<string, unknown>, from = 0, size = 20) {
    try {
      const { hits } = await esClient.search({
        index,
        from,
        size,
        body: { query },
      });
      return hits.hits.map(hit => hit._source); // Extract the `_source` from hits
    } catch (err) {
      throw logAndCleanError(err, { index }, 'Error searching documents');
    }
  },

  async searchTickets(term: string) {
    // The standard analyzer splits `name` into tokens on non-alphanumeric characters
    // (e.g. "tls-fix-verify" -> ["tls", "fix", "verify"]), and wildcard/fuzzy queries
    // match against a single token. Split the search term the same way and require
    // every token to match somewhere in the field, so multi-word/hyphenated terms
    // (e.g. "tls-fix") work rather than only ever matching a single whole token.
    const tokens = term.split(/[^a-zA-Z0-9]+/).filter(Boolean);

    return elasticService.searchDocuments('tickets', {
      bool: {
        must: (tokens.length > 0 ? tokens : [term]).map((token) => ({
          bool: {
            should: [
              { wildcard: { name: { value: `*${token}*` } } },
              { fuzzy: { name: { value: token, fuzziness: 'AUTO' } } },
            ],
          },
        })),
      },
    });
  },

  async updateDocument(index: string, id: string, body: Record<string, unknown>) {
    try {
      return await esClient.update({ index, id, body });
    } catch (err) {
      throw logAndCleanError(err, { index, id }, 'Error updating document');
    }
  },

  async deleteDocument(index: string, id: string) {
    try {
      return await esClient.delete({ index, id });
    } catch (err) {
      throw logAndCleanError(err, { index, id }, 'Error deleting document');
    }
  },
};

export default elasticService;
