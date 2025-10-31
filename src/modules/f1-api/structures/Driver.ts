import { CircuitsUrlBuilder } from '../builders';
import type { Api, DriverApiData } from '../http';
import { Model } from './Model';

export class Driver extends Model<DriverApiData> {
    public readonly id: string;
    public readonly url: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly dateOfBirth: Date;
    public readonly nationality: string;

    public constructor(data: DriverApiData, api: Api) {
        super(data, api);

        this.id = data.driverId;
        this.url = data.url;
        this.firstName = data.givenName;
        this.lastName = data.familyName;
        this.dateOfBirth = new Date(data.dateOfBirth);
        this.nationality = data.nationality;
    }

    public get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public circuits(): CircuitsUrlBuilder {
        return new CircuitsUrlBuilder(this.api, { driverId: this.id });
    }
}
