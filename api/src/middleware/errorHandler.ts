import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';

/**
 * Handling errors gracefully
 * 4-arg signature required so Express recognizes this as error-handling middleware
 */
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
	if (err instanceof ApiError) {
		res.status(err.statusCode).json({ error: err.message });
		return;
	}

	console.error(err);
	res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;
