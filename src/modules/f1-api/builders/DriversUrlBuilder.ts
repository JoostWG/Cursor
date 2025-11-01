import type { DriversResponse } from '../http';
import { Driver } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class DriversUrlBuilder extends UrlBuilder<DriversResponse, Driver[]> {
    protected override path(): string {
        return '/drivers';
    }

    protected override transformResponse(data: DriversResponse): Driver[] {
        return this.transformMultiple(data.MRData.DriverTable.Drivers, Driver);
    }
}
