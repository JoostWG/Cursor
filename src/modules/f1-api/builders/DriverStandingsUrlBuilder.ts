import type { DriverStandingsResponse } from '../http';
import { DriverStanding } from '../structures';
import { UrlBuilder, type UrlBuilderOptions } from './UrlBuilder';

export class DriverStandingsUrlBuilder
    extends UrlBuilder<DriverStandingsResponse, DriverStanding[]>
{
    /**
     * Filters for the drivers standing of a specified season.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters for the drivers standings after a specified round in a specific season.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for only for a specific drivers' standing information for a given year.
     */
    public team(id: string): this {
        return this.setOption('teamId', id);
    }

    protected override path(): string {
        return '/driverstandings';
    }

    protected override transformResponse(data: DriverStandingsResponse): DriverStanding[] {
        return this.transformMultiple(
            data.MRData.StandingsTable.StandingsLists[0].DriverStandings,
            DriverStanding,
        );
    }
}
