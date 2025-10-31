import type { Client, Pagination } from '../http';
import type { Circuit } from '../structures';

export class DriverProxy {
    public constructor(public readonly driverId: string, private readonly client: Client) {
        //
    }

    public async getCircuits(pagination?: Pagination): Promise<Circuit[]> {
        return await this.client.getDriverCircuits(this.driverId, pagination);
    }
}
