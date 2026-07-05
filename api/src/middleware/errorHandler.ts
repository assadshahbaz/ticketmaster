import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

/**
 * Handling errors gracefully
 * 4-arg signature required so Express recognizes this as error-handling middleware
 */
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
	if (err instanceof ApiError) {
		res.status(err.statusCode).json({ error: err.message });
		return;
	}

	logger.error({ err, method: req.method, path: req.path }, 'Unhandled error');

	// pino-http falls back to a generic "failed with status code X" message on its
	// own request-completed log unless res.err is set — give it the real cause.
	res.err = err instanceof Error ? err : new Error(String(err));
	res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;
