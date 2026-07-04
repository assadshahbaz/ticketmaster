import { CorsOptions } from 'cors';
import { env } from './env';

/** Comma-separated list of allowed origins, e.g. "http://localhost:4200,https://app.example.com" */
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
    origin: allowedOrigins,
};
