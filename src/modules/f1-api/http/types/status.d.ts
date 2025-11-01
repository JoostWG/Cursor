import type { StatusType } from '../../enums';
import type { SuccessResponse } from '.';

export interface StatusApiData {
    statusId: StatusType;
    count: string;
    status: string;
}

export type StatusesResponse = SuccessResponse<{
    StatusTable: {
        Status: StatusApiData[];
    };
}>;
