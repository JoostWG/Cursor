import type { Api, StatusesResponse } from '../http';
import { Status } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class StatusUrlBuilder extends UrlBuilder<StatusesResponse, Status | null> {
    public constructor(api: Api, private readonly statusId: number) {
        super(api);
    }

    protected override path(): string {
        return `/status${this.statusId}`;
    }

    protected override transformResponse(data: StatusesResponse): Status | null {
        return this.transformSingle(data.MRData.StatusTable.Status, Status);
    }
}
