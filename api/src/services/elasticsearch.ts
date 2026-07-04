import fs from 'fs';
import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';

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

// Elasticsearch service methods
const elasticService = {
  async indexDocument(index: string, id: string, body: Record<string, unknown>) {
    return esClient.index({ index, id, body });
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
      console.error('Error searching documents:', err);
      throw err;
    }
  },

  async searchTickets(term: string) {
    return elasticService.searchDocuments('tickets', {
      bool: {
        should: [
          { wildcard: { name: { value: `*${term}*` } } },
          { fuzzy: { name: { value: term, fuzziness: 'AUTO' } } },
        ],
      },
    });
  },

  async updateDocument(index: string, id: string, body: Record<string, unknown>) {
    return esClient.update({ index, id, body });
  },

  async deleteDocument(index: string, id: string) {
    return esClient.delete({ index, id });
  },
};

export default elasticService;
