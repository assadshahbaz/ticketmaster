import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import ApiError from '../utils/ApiError';

/**
 * Validates req.body against the given schema and replaces it with the parsed
 * result, so controllers can trust the shape/types of req.body without re-checking.
 */
const validate = (schema: ZodType) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.issues.map((issue) => issue.message).join(', ');
            next(new ApiError(400, message));
            return;
        }

        req.body = result.data;
        next();
    };

export default validate;
