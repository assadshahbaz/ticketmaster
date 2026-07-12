import { Document, Schema } from 'mongoose';
import elasticService from '../services/elasticsearch';
import logger from '../config/logger';

export interface ESSearchable<T> {
  /** Full-text search backed by the index this plugin was configured with. */
  search(term: string, opts?: { from?: number; size?: number }): Promise<Partial<T>[]>;
}

export interface EsIndexPluginOptions<T> {
  /** Elasticsearch index this model is kept in sync with. */
  index: string;
  /** Shapes the ES document from a mongoose document. Keep it to searchable/displayable fields. */
  toDocument: (doc: T) => Record<string, unknown>;
  /** Fields `search()` matches against; each must exist in the shape `toDocument` produces. */
  searchFields: string[];
  /** Optional index mappings, applied once when the index is first created. */
  mappings?: Record<string, unknown>;
}

// The standard analyzer splits fields into tokens on non-alphanumeric characters
// (e.g. "tls-fix-verify" -> ["tls", "fix", "verify"]), and wildcard/fuzzy queries
// only ever match a single token. Split the search term the same way and require
// every token to match somewhere in at least one field, so multi-word/hyphenated
// terms (e.g. "tls-fix") work rather than only ever matching a single whole token.
const buildSearchQuery = (term: string, fields: string[]): Record<string, unknown> => {
  const tokens = term.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  return {
    bool: {
      must: (tokens.length > 0 ? tokens : [term]).map((token) => ({
        bool: {
          should: fields.flatMap((field) => [
            { wildcard: { [field]: { value: `*${token}*` } } },
            { fuzzy: { [field]: { value: token, fuzziness: 'AUTO' } } },
          ]),
        },
      })),
    },
  };
};

/**
 * Attaches a mongoose schema to an Elasticsearch index: every save/update/delete
 * that goes through this model is mirrored into ES, and the model gains a
 * `search()` static backed by it. To add ES to a new module, just plug it in:
 *
 *   esIndexPlugin(schema, {
 *     index: 'widgets',
 *     toDocument: (doc) => ({ name: doc.name }),
 *     searchFields: ['name'],
 *   });
 *
 * Called directly (rather than via `schema.plugin(...)`) so TypeScript can
 * infer the document type from `schema` instead of widening it to the base
 * mongoose `Document` — a limitation of `Schema.plugin`'s own generics.
 */
export default function esIndexPlugin<T extends Document>(
  schema: Schema<T>,
  options: EsIndexPluginOptions<T>,
): void {
  const { index, toDocument, searchFields, mappings } = options;

  // Fire-and-forget: ES is a secondary search index, not the source of truth,
  // so a sync failure (or ES being temporarily down) must never fail the
  // Mongo write or update that triggered it. Failures are logged instead.
  const syncInBackground = (op: string, run: () => Promise<unknown>): void => {
    run().catch((err) => logger.error({ err, index, op }, 'Elasticsearch sync failed'));
  };

  elasticService.ensureIndex(index, mappings);

  schema.post('save', function (doc: T) {
    syncInBackground('index', () => elasticService.index(index, doc._id.toString(), toDocument(doc)));
  });

  // Requires callers to pass `{ new: true }` so `doc` reflects the post-update
  // state; that's already this codebase's convention for findOneAndUpdate.
  schema.post('findOneAndUpdate', function (doc: T | null) {
    if (!doc) return;
    syncInBackground('update', () => elasticService.update(index, doc._id.toString(), toDocument(doc)));
  });

  schema.post('findOneAndDelete', function (doc: T | null) {
    if (!doc) return;
    syncInBackground('delete', () => elasticService.delete(index, doc._id.toString()));
  });

  schema.statics.search = async function (term: string, opts: { from?: number; size?: number } = {}) {
    return elasticService.search(index, buildSearchQuery(term, searchFields), opts.from, opts.size);
  };
}
