import type { StatusType } from '../../enums';
import type { CircuitsResponse } from '../../http';
import { Circuit } from '../../structures';
import { UrlBuilder, type UrlBuilderOptions } from '../UrlBuilder';

export class CircuitsUrlBuilder extends UrlBuilder<CircuitsResponse, Circuit[]> {
    /**
     * Filters only circuits which hosted a race in a given season.
     */
    public season(year: UrlBuilderOptions['year']): this {
        return this.setOption('year', year);
    }

    /**
     * Filters only for the circuit that hosted the race in the specified round of the specific season.
     */
    public round(round: UrlBuilderOptions['round']): this {
        return this.setOption('round', round);
    }

    /**
     * Filters for only circuits that the specified team has participated in a race at.
     */
    public team(id: string): this {
        return this.setOption('teamId', id);
    }

    /**
     * Filters for only circuits that the specified driver has participated in a race at.
     */
    public driver(id: string): this {
        return this.setOption('driverId', id);
    }

    /**
     * Filters for a list of circuits where a race finished with a driver completing a lap that was the ranked in the specified position.
     */
    public fastest(rank = 1): this {
        return this.setOption('fastestRank', rank);
    }

    /**
     * Filters for only circuits that have had a race with a specific grid position.
     */
    public grid(position: number): this {
        return this.setOption('gridPosition', position);
    }

    /**
     * Filters for only circuits that have had a race where a specific finishing position was valid.
     */
    public result(position: number): this {
        return this.setOption('finishPosition', position);
    }

    /**
     * Filters for only circuits that have had a race where a driver finished with a specific status.
     */
    public status(status: StatusType): this {
        return this.setOption('status', status);
    }

    protected override path(): string {
        return '/circuits';
    }

    protected override transformResponse(data: CircuitsResponse): Circuit[] {
        return this.transformMultiple(data.MRData.CircuitTable.Circuits, Circuit);
    }
}
