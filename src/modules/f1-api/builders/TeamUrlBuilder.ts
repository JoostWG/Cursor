import type { ConstructorsResponse } from '../http';
import { Team } from '../structures';
import { CircuitsUrlBuilder } from './CircuitsUrlBuilder';
import { DriversUrlBuilder } from './DriversUrlBuilder';
import { LapsUrlBuilder } from './LapsUrlBuilder';
import { TeamStandingsUrlBuilder } from './TeamStandingsUrlBuilder';
import { UrlBuilder } from './UrlBuilder';

export class TeamUrlBuilder extends UrlBuilder<ConstructorsResponse, Team | null> {
    public circuits(): CircuitsUrlBuilder {
        return this.builder(CircuitsUrlBuilder);
    }

    public drivers(): DriversUrlBuilder {
        return this.builder(DriversUrlBuilder);
    }

    public teamStandings(): TeamStandingsUrlBuilder {
        return this.builder(TeamStandingsUrlBuilder);
    }

    public laps(): LapsUrlBuilder {
        return this.builder(LapsUrlBuilder);
    }

    protected override transformResponse(data: ConstructorsResponse): Team | null {
        return this.transformSingle(data.MRData.ConstructorTable.Constructors, Team);
    }
}
