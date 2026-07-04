import { NextFunction, Request, RequestHandler, Response } from 'express';

/** catch rejected promises from async handlers; forward them to next() instead */
const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
