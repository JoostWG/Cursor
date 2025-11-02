import type { DriversResponse } from '../http';
import { Driver } from '../structures';
import { CircuitsUrlBuilder } from './CircuitsUrlBuilder';
import { LapsUrlBuilder } from './LapsUrlBuilder';
import { RacesUrlBuilder } from './RacesUrlBuilder';
import { ResultsUrlBuilder } from './ResultsUrlBuilder';
import { TeamsUrlBuilder } from './TeamsUrlBuilder';
import { UrlBuilder } from './UrlBuilder';

export class DriverUrlBuilder extends UrlBuilder<DriversResponse, Driver | null> {
    public circuits(): CircuitsUrlBuilder {
        return this.builder(CircuitsUrlBuilder);
    }

    public races(): RacesUrlBuilder {
        return this.builder(RacesUrlBuilder);
    }

    public results(): ResultsUrlBuilder {
        return this.builder(ResultsUrlBuilder);
    }

    public teams(): TeamsUrlBuilder {
        return this.builder(TeamsUrlBuilder);
    }

    public laps(): LapsUrlBuilder {
        return this.builder(LapsUrlBuilder);
    }

    protected override transformResponse(data: DriversResponse): Driver | null {
        return this.transformSingle(data.MRData.DriverTable.Drivers, Driver);
    }
}
