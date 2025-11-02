import type { RacesResponse } from '../../http';
import { Race } from '../../structures';
import { UrlBuilder } from '../UrlBuilder';

export class RacesUrlBuilder extends UrlBuilder<RacesResponse, Race[]> {
    protected override path(): string {
        return '/races';
    }

    protected override transformResponse(data: RacesResponse): Race[] {
        return this.transformMultiple(data.MRData.RaceTable.Races, Race);
    }
}
