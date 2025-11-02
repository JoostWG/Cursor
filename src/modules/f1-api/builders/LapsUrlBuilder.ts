import type { LapsResponse } from '../http';
import { Lap } from '../structures';
import { UrlBuilder, type UrlBuilderOptions } from './UrlBuilder';

export class LapsUrlBuilder extends UrlBuilder<LapsResponse, Lap[]> {
    /**
     * Filters for the season that the list of laps will be from.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters for the round in a specific season that the list of laps will be from.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for only for a specific drivers's list of laps in a specific race.
     */
    public driver(id: string): this {
        return this.setOption('driverId', id);
    }

    /**
     * Filters for the lap data for the drivers of a specific team in a given race.
     */
    public team(id: string): this {
        return this.setOption('teamId', id);
    }

    /**
     * Filters for the nth lap for each driver in a given race.
     */
    public lap(lap: number): this {
        return this.setOption('lap', lap);
    }

    protected override path(): string {
        return '/laps';
    }

    protected override transformResponse(data: LapsResponse): Lap[] {
        return this.transformMultiple(data.MRData.RaceTable.Races[0].Laps, Lap);
    }
}
