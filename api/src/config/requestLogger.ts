import pinoHttp from 'pino-http';
import logger from './logger';

// Successful requests log at "debug" so they're silent at the default "info" level;
// bump LOG_LEVEL to "debug" locally to see them. Client/server errors stay visible.
const requestLogger = pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'debug';
    },
    customErrorMessage: (req, res, err) => `${req.method} ${req.url} failed with ${res.statusCode}: ${err.message}`,
    // Default req/res serializers dump full headers on every line; keep only what's useful to trace a request.
    serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
});

export default requestLogger;
