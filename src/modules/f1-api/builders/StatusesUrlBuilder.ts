import type { StatusesResponse } from '../http';
import { Status } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class StatusesUrlBuilder extends UrlBuilder<StatusesResponse, Status[]> {
    protected override path(): string {
        return '/status';
    }

    protected override transformResponse(data: StatusesResponse): Status[] {
        return this.transformMultiple(data.MRData.StatusTable.Status, Status);
    }
}
