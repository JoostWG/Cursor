import type { SeasonsResponse } from '../../http';
import { Season } from '../../structures';
import { UrlBuilder } from '../UrlBuilder';

export class SeasonsUrlBuilder extends UrlBuilder<SeasonsResponse, Season[]> {
    protected override path(): string {
        return '/seasons';
    }

    protected override transformResponse(data: SeasonsResponse): Season[] {
        return this.transformMultiple(data.MRData.SeasonTable.Seasons, Season);
    }
}
