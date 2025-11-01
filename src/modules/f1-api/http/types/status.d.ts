import type { SuccessResponse } from '.';

export interface StatusApiData {
    statusId: string;
    count: string;
    status: string;
}

export type StatusesResponse = SuccessResponse<{
    StatusTable: {
        Status: StatusApiData[];
    };
}>;
