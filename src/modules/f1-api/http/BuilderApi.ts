import {
    CircuitsUrlBuilder,
    DriverStandingsUrlBuilder,
    DriversUrlBuilder,
    PitStopsUrlBuilder,
    RacesUrlBuilder,
    ResultsUrlBuilder,
    SeasonUrlBuilder,
    SeasonsUrlBuilder,
    SprintResultsUrlBuilder,
    StatusesUrlBuilder,
    TeamStandingsUrlBuilder,
    TeamsUrlBuilder,
    type UrlBuilderOptions,
} from '../builders';
import { Api } from './Api';

export class BuilderApi extends Api {
    public circuits(): CircuitsUrlBuilder {
        return new CircuitsUrlBuilder(this);
    }

    public driverStandings(): DriverStandingsUrlBuilder {
        return new DriverStandingsUrlBuilder(this);
    }

    public drivers(): DriversUrlBuilder {
        return new DriversUrlBuilder(this);
    }

    public pitStops(): PitStopsUrlBuilder {
        return new PitStopsUrlBuilder(this);
    }

    public races(): RacesUrlBuilder {
        return new RacesUrlBuilder(this);
    }

    public results(): ResultsUrlBuilder {
        return new ResultsUrlBuilder(this);
    }

    public seasons(): SeasonsUrlBuilder {
        return new SeasonsUrlBuilder(this);
    }

    public sprintResults(): SprintResultsUrlBuilder {
        return new SprintResultsUrlBuilder(this);
    }

    public statuses(): StatusesUrlBuilder {
        return new StatusesUrlBuilder(this);
    }

    public teamStandings(): TeamStandingsUrlBuilder {
        return new TeamStandingsUrlBuilder(this);
    }

    public teams(): TeamsUrlBuilder {
        return new TeamsUrlBuilder(this);
    }

    // Single

    public season(year: UrlBuilderOptions['year']): SeasonUrlBuilder {
        return new SeasonUrlBuilder(this, year);
    }
}
