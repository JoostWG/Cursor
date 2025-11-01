import type { Api, RacesResponse } from '../http';
import { Race } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class RacesUrlBuilder extends UrlBuilder<RacesResponse, Race[]> {
    public constructor(api: Api) {
        super(api);
    }

    protected override path(): string {
        return '/races';
    }

    protected override transformResponse(data: RacesResponse): Race[] {
        return this.transformMultiple(data.MRData.RaceTable.Races, Race);
    }
}
