import type { Api, CircuitsResponse } from '../http';
import { Circuit } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class CircuitsUrlBuilder extends UrlBuilder<CircuitsResponse, Circuit[]> {
    public constructor(
        api: Api,
        private readonly options: {
            driverId?: string;
            seasonYear?: string;
        } = {},
    ) {
        super(api);
    }

    public forDriver(id: string): this {
        this.options.driverId = id;

        return this;
    }

    public forSeason(year: string): this {
        this.options.seasonYear = year;

        return this;
    }

    protected override path(): string {
        let path = '/circuits';

        if (this.options.seasonYear) {
            path = `/${this.options.seasonYear}${path}`;
        }

        if (this.options.driverId) {
            path = `/drivers/${this.options.driverId}${path}`;
        }

        return path;
    }

    protected override transformResponse(data: CircuitsResponse): Circuit[] {
        return this.transformMultiple(data.MRData.CircuitTable.Circuits, Circuit);
    }
}
