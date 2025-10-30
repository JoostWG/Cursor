import type { Client, DriverApiData, Pagination } from '../http';
import { DriverProxy } from '../proxies';
import type { Circuit } from './Circuit';
import { Model } from './Model';

export class Driver extends Model<DriverApiData> {
    public readonly id: string;
    public readonly url: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly dateOfBirth: Date;
    public readonly nationality: string;
    private readonly proxy: DriverProxy;

    public constructor(data: DriverApiData, client: Client) {
        super(data, client);

        this.id = data.driverId;
        this.url = data.url;
        this.firstName = data.givenName;
        this.lastName = data.familyName;
        this.dateOfBirth = new Date(data.dateOfBirth);
        this.nationality = data.nationality;

        this.proxy = new DriverProxy(this.id, this.client);
    }

    public get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public async getCircuits(pagination?: Pagination): Promise<Circuit[]> {
        return await this.proxy.getCircuits(pagination);
    }
}
