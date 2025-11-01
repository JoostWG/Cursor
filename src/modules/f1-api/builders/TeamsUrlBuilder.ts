import type { StatusType } from '../enums';
import type { ConstructorsResponse } from '../http';
import { Team } from '../structures';
import { UrlBuilder, type UrlBuilderOptions } from './UrlBuilder';

export class TeamsUrlBuilder extends UrlBuilder<ConstructorsResponse, Team[]> {
    /**
     * Filters only teams that participated in a specified season.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters only teams that participated in a specified round of a specific season.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for only teams who have participated in a race at a given circuit.
     */
    public circuit(id: string): this {
        return this.setOption('circuitId', id);
    }

    /**
     * Filters for only teams that had a driver race for them.
     */
    public driver(id: string): this {
        return this.setOption('driverId', id);
    }

    /**
     * Filters for only teams which had a driver racing for them start a race in a specific grid position.
     */
    public grid(position: number): this {
        return this.setOption('gridPosition', position);
    }

    /**
     * Filters for only teams which had a driver racing for them finish a race in a specific position.
     */
    public result(position: number): this {
        return this.setOption('finishPosition', position);
    }

    /**
     * Filters for only teams who had a driver finish a race with a specific status.
     */
    public status(status: StatusType): this {
        return this.setOption('status', status);
    }

    protected override path(): string {
        return `/constructors`;
    }

    protected override transformResponse(data: ConstructorsResponse): Team[] {
        return this.transformMultiple(data.MRData.ConstructorTable.Constructors, Team);
    }
}
