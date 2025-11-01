import type { Api, SeasonsResponse } from '../http';
import { Season } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class SeasonsUrlBuilder extends UrlBuilder<SeasonsResponse, Season[]> {
    public constructor(api: Api) {
        super(api);
    }

    protected override path(): string {
        return '/seasons';
    }

    protected override transformResponse(data: SeasonsResponse): Season[] {
        return this.transformMultiple(data.MRData.SeasonTable.Seasons, Season);
    }
}
