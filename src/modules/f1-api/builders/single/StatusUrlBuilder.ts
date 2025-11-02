import type { StatusesResponse } from '../../http';
import { Status } from '../../structures';
import { CircuitsUrlBuilder, DriversUrlBuilder, TeamsUrlBuilder } from '../multiple';
import { UrlBuilder } from '../UrlBuilder';

export class StatusUrlBuilder extends UrlBuilder<StatusesResponse, Status | null> {
    public circuits(): CircuitsUrlBuilder {
        return this.builder(CircuitsUrlBuilder);
    }

    public drivers(): DriversUrlBuilder {
        return this.builder(DriversUrlBuilder);
    }

    public teams(): TeamsUrlBuilder {
        return this.builder(TeamsUrlBuilder);
    }

    protected override transformResponse(data: StatusesResponse): Status | null {
        return this.transformSingle(data.MRData.StatusTable.Status, Status);
    }
}
