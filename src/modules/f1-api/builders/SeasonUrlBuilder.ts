import type { SeasonsResponse } from '../http';
import { Season } from '../structures';
import { CircuitsUrlBuilder } from './CircuitsUrlBuilder';
import { DriverStandingsUrlBuilder } from './DriverStandingsUrlBuilder';
import { DriversUrlBuilder } from './DriversUrlBuilder';
import { LapsUrlBuilder } from './LapsUrlBuilder';
import { RacesUrlBuilder } from './RacesUrlBuilder';
import { ResultsUrlBuilder } from './ResultsUrlBuilder';
import { TeamStandingsUrlBuilder } from './TeamStandingsUrlBuilder';
import { TeamsUrlBuilder } from './TeamsUrlBuilder';
import { UrlBuilder } from './UrlBuilder';

export class SeasonUrlBuilder extends UrlBuilder<SeasonsResponse, Season | null> {
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

    protected override transformResponse(data: SeasonsResponse): Season | null {
        return this.transformSingle(data.MRData.SeasonTable.Seasons, Season);
    }
}
