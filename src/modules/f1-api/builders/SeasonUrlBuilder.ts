import type { Api, SeasonsResponse } from '../http';
import { Season } from '../structures';
import { CircuitsUrlBuilder } from './CircuitsUrlBuilder';
import { DriversUrlBuilder } from './DriversUrlBuilder';
import { UrlBuilder } from './UrlBuilder';

export class SeasonUrlBuilder extends UrlBuilder<SeasonsResponse, Season | null> {
    public constructor(api: Api, public readonly year: string) {
        super(api);
    }

    public circuits(): CircuitsUrlBuilder {
        return new CircuitsUrlBuilder(this.api, { seasonYear: this.year });
    }

    public drivers(): DriversUrlBuilder {
        return new DriversUrlBuilder(this.api, { seasonYear: this.year });
    }

    protected override path(): string {
        return `/${this.year}`;
    }

    protected override transformResponse(data: SeasonsResponse): Season | null {
        return this.transformSingle(data.MRData.SeasonTable.Seasons, Season);
    }
}
