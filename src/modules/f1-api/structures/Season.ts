import type { Api, SeasonApiData } from '../http';
import { Model } from './Model';

export class Season extends Model<SeasonApiData> {
    public readonly year: string;
    public readonly url: string;

    public constructor(data: SeasonApiData, api: Api) {
        super(data, api);

        this.year = data.season;
        this.url = data.url;
    }

    public override toString(): string {
        return this.year;
    }
}
