import type { ResultsResponse } from '../http';
import { Result } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class ResultsUrlBuilder extends UrlBuilder<ResultsResponse, Result[]> {
    protected override path(): string {
        return '/results';
    }

    protected override transformResponse(data: ResultsResponse): Result[] {
        return this.transformMultiple(data.MRData.RaceTable.Races[0].Results, Result);
    }
}
