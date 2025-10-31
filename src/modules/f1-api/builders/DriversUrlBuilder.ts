import type { Api, DriversResponse } from '../http';
import { Driver } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class DriversUrlBuilder extends UrlBuilder<DriversResponse, Driver[]> {
    public constructor(
        api: Api,
        private readonly options: {
            circuitId?: string;
            seasonYear?: string;
        } = {},
    ) {
        super(api);
    }

    protected override path(): string {
        let path = '/drivers';

        if (this.options.seasonYear) {
            path = `/${this.options.seasonYear}${path}`;
        }

        if (this.options.circuitId) {
            path = `/circuits/${this.options.circuitId}${path}`;
        }

        return path;
    }

    protected override transformResponse(data: DriversResponse): Driver[] {
        return data.MRData.DriverTable.Drivers.map((driver) => new Driver(driver, this.api));
    }
}
