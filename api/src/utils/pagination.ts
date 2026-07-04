import { Request } from 'express';
import { PAGINATION_DEFAULTS } from '../config/pagination';

export interface Pagination {
    page: number;
    limit: number;
}

/**
 * Reads page/limit off the query string, falling back to the standard defaults
 * and clamping to the standard maxLimit. Shared across every paginated API.
 */
const getPagination = (req: Request): Pagination => {
    const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.page);
    const limit = Math.min(
        PAGINATION_DEFAULTS.maxLimit,
        Math.max(1, Number(req.query.limit) || PAGINATION_DEFAULTS.limit)
    );

    return { page, limit };
};

export default getPagination;
