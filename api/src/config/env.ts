import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export enum ENVIROMENTS {
    DEV = 'development',
    PROD = 'production',
    TEST = 'test',
}

enum LOG_LEVELS {
    FATAL = 'fatal',
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace',
    SILENT = 'silent',
}

interface IEnv {
    NODE_ENV: ENVIROMENTS;
    LOG_LEVEL: LOG_LEVELS;
    PORT: number;
    API_URL: string;
    MONGO_URI: string;
    CORS_ORIGIN: string;
    ELASTICSEARCH_URL: string;
    ELASTIC_USERNAME: string;
    ELASTIC_PASSWORD: string;
    ELASTIC_CA_PATH: string;
}

const envSchema = z.object({
    NODE_ENV: z.enum(ENVIROMENTS).default(ENVIROMENTS.DEV),
    LOG_LEVEL: z.enum(LOG_LEVELS, { error: 'LOG_LEVEL is required' }),
    PORT: z.coerce.number({ error: 'PORT is required' }),
    API_URL: z.string().min(1, 'API_URL is required'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
    ELASTICSEARCH_URL: z.string().min(1, 'ELASTICSEARCH_URL is required'),
    ELASTIC_USERNAME: z.string().min(1, 'ELASTIC_USERNAME is required'),
    ELASTIC_PASSWORD: z.string().min(1, 'ELASTIC_PASSWORD is required'),
    ELASTIC_CA_PATH: z.string().min(1, 'ELASTIC_CA_PATH is required'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    // Runs before the logger exists (the logger's own level depends on this),
    // so failures here are reported via plain console.error, not the logger.
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
}

export const env: IEnv = result.data;
