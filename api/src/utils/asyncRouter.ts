import { RequestHandler, Router } from 'express';
import asyncHandler from '../middleware/asyncHandler';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

/**
 * A Router whose route handlers are auto-wrapped in asyncHandler, so controllers
 * never need to think about forwarding rejected promises to next() themselves.
 */
const createAsyncRouter = (): Router => {
    const router = Router();

    METHODS.forEach((method) => {
        const original = router[method].bind(router);
        router[method] = ((path: string, ...handlers: RequestHandler[]) =>
            original(path, ...handlers.map(asyncHandler))) as Router[typeof method];
    });

    return router;
};

export default createAsyncRouter;
