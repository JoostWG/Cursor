export type * from './circuit';
export type * from './common';
export type * from './constructor';
export type * from './constructor-standing';
export type * from './driver';
export type * from './driver-standing';
export type * from './lap';
export type * from './pit-stop';
export type * from './qualifying-result';
export type * from './race';
export type * from './result';
export type * from './season';
export type * from './sprint-result';
export type * from './status';

export interface Pagination {
    /**
     * Maximum number of results results returned. Defaults to 30. Max is 100
     */
    limit?: number;
    /**
     * Allows you to offset the results by the specified number for pagination. Defaults to 0.
     */
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
