import type { PitStopsResponse } from '../../http';
import { PitStop } from '../../structures';
import { UrlBuilder, type UrlBuilderOptions } from '../UrlBuilder';

export class PitStopsUrlBuilder extends UrlBuilder<PitStopsResponse, PitStop[]> {
    /**
     * Filters for the season that the list of pit stops will be from.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters for the round in a specific season that the list of pits tops will be from.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for the nth stop for each driver in a given race.
     */
    public stopNumber(number: number): this {
        return this.setOption('pitStopNumber', number);
    }

    /**
     * Filters for only for a specific drivers's list of pit stops in a season's round.
     */
    public driver(id: string): this {
        return this.setOption('driverId', id);
    }

    /**
     * Filters for only pit stops that took place in a given lap of a race.
     */
    public lap(lap: number): this {
        return this.setOption('lap', lap);
    }

    protected override path(): string {
        return '/pitstops';
    }

    protected override transformResponse(data: PitStopsResponse): PitStop[] {
        return this.transformMultiple(data.MRData.RaceTable.Races[0].PitStops, PitStop);
    }
}
