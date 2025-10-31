import { CircuitLocation } from '../data/CircuitLocation';
import type { Client } from '../http/Client';
import type { CircuitApiData } from '../http/types';
import { Model } from './Model';

export class Circuit extends Model<CircuitApiData> {
    public readonly id: string;
    public readonly url: string;
    public readonly name: string;
    public readonly location: CircuitLocation;

    public constructor(data: CircuitApiData, client: Client) {
        super(data, client);

        this.id = data.circuitId;
        this.url = data.url;
        this.name = data.circuitName;
        this.location = new CircuitLocation(data.Location);
    }
}
