import type { ConstructorStandingsResponse } from '../http';
import { TeamStanding } from '../structures';
import { UrlBuilder, type UrlBuilderOptions } from './UrlBuilder';

export class TeamStandingsUrlBuilder
    extends UrlBuilder<ConstructorStandingsResponse, TeamStanding[]>
{
    /**
     * Filters for the teams standing of a specified season.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters for the teams standings after a specified round in a specific season.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for only for a specific teams' standing information for a given year.
     */
    public team(id: string): this {
        return this.setOption('teamId', id);
    }

    protected override path(): string {
        return '/constructorstandings';
    }

    protected override transformResponse(data: ConstructorStandingsResponse): TeamStanding[] {
        return this.transformMultiple(
            data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings,
            TeamStanding,
        );
    }
}
