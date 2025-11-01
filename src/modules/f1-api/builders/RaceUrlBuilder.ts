import type { RacesResponse } from '../http';
import { Race } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class RaceUrlBuilder extends UrlBuilder<RacesResponse, Race | null> {
    protected override path(): string {
        return `/races`;
    }

    protected override transformResponse(data: RacesResponse): Race | null {
        return this.transformSingle(data.MRData.RaceTable.Races, Race);
    }
}
