/** Standard pagination defaults/limits, applied as the fallback across all APIs */
export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 20,
    maxLimit: 100,
} as const;
