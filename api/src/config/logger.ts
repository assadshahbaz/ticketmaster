import pino from 'pino';
import { env, ENVIROMENTS } from './env';

/** Level is controlled by LOG_LEVEL (see .env) — bump to "debug" while debugging locally */
const logger = pino({
    level: env.LOG_LEVEL,
    transport: env.NODE_ENV === ENVIROMENTS.PROD
        ? undefined
        : { target: 'pino-pretty', options: { colorize: true } },
});

export default logger;
