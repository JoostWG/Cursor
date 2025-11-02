import type { StatusType } from '../enums';
import type { DriversResponse } from '../http';
import { Driver } from '../structures';
import { UrlBuilder, type UrlBuilderOptions } from './UrlBuilder';

export class DriversUrlBuilder extends UrlBuilder<DriversResponse, Driver[]> {
    /**
     * Filters only drivers that participated in a specified season.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters only drivers that participated in a specified round of a specific season.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for only drivers who have participated in a race at a given circuit.
     */
    public circuit(id: string): this {
        return this.setOption('circuitId', id);
    }

    /**
     * Filters for only drivers who have raced for a specified team.
     */
    public team(id: string): this {
        return this.setOption('teamId', id);
    }

    /**
     * Filters for only drivers that finished a race with a lap that was the ranked in the specified position.
     */
    public fastest(rank = 1): this {
        return this.setOption('fastestRank', rank);
    }

    /**
     * Filters for only drivers who have started a race in a specific grid position.
     */
    public grid(position: number): this {
        return this.setOption('gridPosition', position);
    }

    /**
     * Filters for only drivers who have finished a race in a specific position.
     */
    public result(position: number): this {
        return this.setOption('finishPosition', position);
    }

    /**
     * Filters for only drivers who have finished a race with a specific status.
     */
    public status(status: StatusType): this {
        return this.setOption('status', status);
    }

    protected override path(): string {
        return '/drivers';
    }

    protected override transformResponse(data: DriversResponse): Driver[] {
        return this.transformMultiple(data.MRData.DriverTable.Drivers, Driver);
    }
}
