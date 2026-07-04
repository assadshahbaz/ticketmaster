import fs from 'fs';
import { Client } from '@elastic/elasticsearch';

// Initialize Elasticsearch client
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'elastic',
    },
    tls: {
        ca: fs.readFileSync(process.env.ELASTIC_CA_PATH || 'C:/Users/Assad/Downloads/elasticsearch-8.17.0/config/certs/http_ca.crt'),
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

    async updateDocument(index: string, id: string, body: Record<string, unknown>) {
        return esClient.update({ index, id, body });
    },

    async deleteDocument(index: string, id: string) {
        return esClient.delete({ index, id });
    },
};

export default elasticService;
