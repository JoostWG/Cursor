import type { Pagination } from './types';

export interface ApiCache {
    get: <T>(path: string, pagination?: Pagination) => Promise<T | null>;
    set: (data: unknown, path: string, pagination?: Pagination) => Promise<void>;
}
