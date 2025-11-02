import type { Api, SeasonsResponse } from '../../http';
import { Season } from '../../structures';
import {
    CircuitsUrlBuilder,
    DriverStandingsUrlBuilder,
    DriversUrlBuilder,
    LapsUrlBuilder,
    PitStopsUrlBuilder,
    RacesUrlBuilder,
    ResultsUrlBuilder,
    TeamStandingsUrlBuilder,
    TeamsUrlBuilder,
} from '../multiple';
import { UrlBuilder, type UrlBuilderOptions } from '../UrlBuilder';

export class SeasonUrlBuilder extends UrlBuilder<SeasonsResponse, Season | null> {
    public constructor(api: Api, private readonly year: UrlBuilderOptions['year']) {
        super(api);
    }

    public circuits(): CircuitsUrlBuilder {
        return this.builder(CircuitsUrlBuilder);
    }

    public driverStandings(): DriverStandingsUrlBuilder {
        return this.builder(DriverStandingsUrlBuilder);
    }

    public drivers(): DriversUrlBuilder {
        return this.builder(DriversUrlBuilder);
    }

    public races(): RacesUrlBuilder {
        return this.builder(RacesUrlBuilder);
    }

    public results(): ResultsUrlBuilder {
        return this.builder(ResultsUrlBuilder);
    }

    public teamStandings(): TeamStandingsUrlBuilder {
        return this.builder(TeamStandingsUrlBuilder);
    }

    public teams(): TeamsUrlBuilder {
        return this.builder(TeamsUrlBuilder);
    }

    public laps(): LapsUrlBuilder {
        return this.builder(LapsUrlBuilder);
    }

    public pitStops(): PitStopsUrlBuilder {
        return this.builder(PitStopsUrlBuilder);
    }

    protected override builderOptions(): UrlBuilderOptions {
        return { year: this.year };
    }

    protected override path(): string {
        return `${this.year}/seasons`;
    }

    protected override transformResponse(data: SeasonsResponse): Season | null {
        return this.transformSingle(data.MRData.SeasonTable.Seasons, Season);
    }
}
