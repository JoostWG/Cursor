import type { SeasonsResponse } from '../http';
import { Season } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class SeasonUrlBuilder extends UrlBuilder<SeasonsResponse, Season | null> {
    protected override path(): string {
        return `/seasons`;
    }

    protected override transformResponse(data: SeasonsResponse): Season | null {
        return this.transformSingle(data.MRData.SeasonTable.Seasons, Season);
    }
}
