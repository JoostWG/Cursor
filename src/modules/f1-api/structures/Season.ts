import { SeasonUrlBuilder, type CircuitsUrlBuilder, type DriversUrlBuilder } from '../builders';
import type { Api, SeasonApiData } from '../http';
import { Model } from './Model';

export class Season extends Model<SeasonApiData> {
    public readonly year: string;
    public readonly url: string;
    private readonly urlBuilder: SeasonUrlBuilder;

    public constructor(data: SeasonApiData, api: Api) {
        super(data, api);

        this.year = data.season;
        this.url = data.url;

        this.urlBuilder = new SeasonUrlBuilder(this.api, this.year);
    }

    public circuits(): CircuitsUrlBuilder {
        return this.urlBuilder.circuits();
    }

    public drivers(): DriversUrlBuilder {
        return this.urlBuilder.drivers();
    }
}
