import type { Api, RacesResponse } from '../http';
import { Race } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class RaceUrlBuilder extends UrlBuilder<RacesResponse, Race | null> {
    public constructor(api: Api, private readonly year: string, private readonly round: number) {
        super(api);
    }

    protected override path(): string {
        return `/${this.year}/${this.round}/races`;
    }

    protected override transformResponse(data: RacesResponse): Race | null {
        return this.transformSingle(data.MRData.RaceTable.Races, Race);
    }
}
