import type { Api, DriversResponse } from '../http';
import { Driver } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class DriverUrlBuilder extends UrlBuilder<DriversResponse, Driver | null> {
    public constructor(api: Api, private readonly driverId: string) {
        super(api);
    }

    protected override path(): string {
        return `/drivers/${this.driverId}`;
    }

    protected override transformResponse(data: DriversResponse): Driver | null {
        return this.transformSingle(data.MRData.DriverTable.Drivers, Driver);
    }
}
