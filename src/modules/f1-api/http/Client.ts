import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import { Circuit, Driver } from '../models';
import type { CircuitsResponse, DriversResponse, Pagination } from './types';

// TODO
// /* eslint-disable @typescript-eslint/naming-convention */
// interface Endpoints {
//     '/circuits': CircuitsResponse;
//     '/drivers': DriversResponse;
// }
// /* eslint-enable @typescript-eslint/naming-convention */

export class Client {
    private readonly api: AxiosInstance;

    public constructor() {
        this.api = axios.create({
            baseURL: 'https://api.jolpi.ca/ergast/f1',
        });
    }

    public async get<T>(path: string, pagination?: Pagination): Promise<AxiosResponse<T>> {
        return this.api.get<T>(path, {
            params: pagination,
            headers: new AxiosHeaders().setContentType('application/json'),
        });
    }

    public async getCircuits(pagination?: Pagination): Promise<Circuit[]> {
        return await this.mapCircuits(this.get<CircuitsResponse>('/circuits', pagination));
    }

    public async getDriverCircuits(driverId: string, pagination?: Pagination): Promise<Circuit[]> {
        return await this.mapCircuits(
            this.get<CircuitsResponse>(`/drivers/${driverId}/circuits`, pagination),
        );
    }

    public async getDriver(id: string): Promise<Driver> {
        // TODO: Driver doesn't exist
        return await this.get<DriversResponse>(`/drivers/${id}`)
            .then(({ data }) => new Driver(data.MRData.DriverTable.Drivers[0], this));
    }

    public async getDrivers(pagination?: Pagination): Promise<Driver[]> {
        return await this.get<DriversResponse>('/drivers', pagination)
            .then(({ data }) =>
                data.MRData.DriverTable.Drivers.map((driverData) => new Driver(driverData, this))
            );
    }

    private async mapCircuits(
        request: Promise<AxiosResponse<CircuitsResponse>>,
    ): Promise<Circuit[]> {
        return await request.then(({ data }) =>
            data.MRData.CircuitTable.Circuits.map((circuitData) => new Circuit(circuitData, this))
        );
    }
}
