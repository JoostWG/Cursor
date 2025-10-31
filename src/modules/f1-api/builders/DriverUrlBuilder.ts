import type { Api, DriversResponse } from '../http';
import { Driver } from '../structures';
import { CircuitsUrlBuilder } from './CircuitsUrlBuilder';
import { UrlBuilder } from './UrlBuilder';

export class DriverUrlBuilder extends UrlBuilder<DriversResponse, Driver | null> {
    public constructor(api: Api, private readonly driverId: string) {
        super(api);
    }

    public circuits(): CircuitsUrlBuilder {
        return new CircuitsUrlBuilder(this.api, { driverId: this.driverId });
    }

    protected override path(): string {
        return `/drivers/${this.driverId}`;
    }

    protected override transformResponse(data: DriversResponse): Driver | null {
        return this.transformSingle(data.MRData.DriverTable.Drivers, Driver);
    }
}
