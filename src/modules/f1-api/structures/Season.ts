import {
    SeasonUrlBuilder,
    type DriverStandingsUrlBuilder,
    type DriversUrlBuilder,
    type LapsUrlBuilder,
    type RacesUrlBuilder,
    type ResultsUrlBuilder,
    type TeamStandingsUrlBuilder,
    type TeamsUrlBuilder,
} from '../builders';
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

        this.urlBuilder = this.getUrlBuilder(SeasonUrlBuilder, this.year);
    }

    public override toString(): string {
        return this.year;
    }

    // API

    public driverStandings(): DriverStandingsUrlBuilder {
        return this.urlBuilder.driverStandings();
    }

    public drivers(): DriversUrlBuilder {
        return this.urlBuilder.drivers();
    }

    public races(): RacesUrlBuilder {
        return this.urlBuilder.races();
    }

    public results(): ResultsUrlBuilder {
        return this.urlBuilder.results();
    }

    public teamStandings(): TeamStandingsUrlBuilder {
        return this.urlBuilder.teamStandings();
    }

    public teams(): TeamsUrlBuilder {
        return this.urlBuilder.teams();
    }

    public laps(): LapsUrlBuilder {
        return this.urlBuilder.laps();
    }
}
