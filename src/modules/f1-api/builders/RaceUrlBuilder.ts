import type { RacesResponse } from '../http';
import { Race } from '../structures';
import { DriverStandingsUrlBuilder } from './DriverStandingsUrlBuilder';
import { DriversUrlBuilder } from './DriversUrlBuilder';
import { LapsUrlBuilder } from './LapsUrlBuilder';
import { ResultsUrlBuilder } from './ResultsUrlBuilder';
import { TeamStandingsUrlBuilder } from './TeamStandingsUrlBuilder';
import { TeamsUrlBuilder } from './TeamsUrlBuilder';
import { UrlBuilder } from './UrlBuilder';

export class RaceUrlBuilder extends UrlBuilder<RacesResponse, Race | null> {
    public driverStandings(): DriverStandingsUrlBuilder {
        return this.builder(DriverStandingsUrlBuilder);
    }

    public drivers(): DriversUrlBuilder {
        return this.builder(DriversUrlBuilder);
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

    protected override path(): string {
        return `/races`;
    }

    protected override transformResponse(data: RacesResponse): Race | null {
        return this.transformSingle(data.MRData.RaceTable.Races, Race);
    }
}
