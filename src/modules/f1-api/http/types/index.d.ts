export type * from './circuit';
export type * from './constructor';
export type * from './driver';
export type * from './season';

export interface Pagination {
    limit?: number;
    offset?: number;
}

export type MRData<T> = T & {
    xmlns: '';
    series: 'f1';
    url: string;
    limit: `${number}`;
    offset: `${number}`;
    total: `${number}`;
};

export interface SuccessResponse<T> {
    MRData: MRData<T>;
}

export interface BadRequestResponse {
    detail: string;
}
