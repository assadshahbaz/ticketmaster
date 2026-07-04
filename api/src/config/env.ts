import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:4200'),
    ELASTICSEARCH_URL: z.string().min(1).default('https://localhost:9200'),
    ELASTIC_USERNAME: z.string().min(1).default('elastic'),
    ELASTIC_PASSWORD: z.string().min(1).default('elastic'),
    ELASTIC_CA_PATH: z.string().min(1, 'ELASTIC_CA_PATH is required'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
}

export const env = result.data;
