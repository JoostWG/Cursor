import type { Api, SprintResultsResponse } from '../http';
import { SprintResult } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class SprintResultsUrlBuilder extends UrlBuilder<SprintResultsResponse, SprintResult[]> {
    public constructor(api: Api) {
        super(api);
    }

    protected override path(): string {
        return '/sprint';
    }

    protected override transformResponse(data: SprintResultsResponse): SprintResult[] {
        return this.transformMultiple(data.MRData.RaceTable.Races[0].SprintResults, SprintResult);
    }
}
