import { CircuitLocation } from '../data';
import type { Api, CircuitApiData } from '../http';
import { Model } from './Model';

export class Circuit extends Model<CircuitApiData> {
    public readonly id: string;
    public readonly url: string;
    public readonly name: string;
    public readonly location: CircuitLocation;

    public constructor(data: CircuitApiData, api: Api) {
        super(data, api);

        this.id = data.circuitId;
        this.url = data.url;
        this.name = data.circuitName;
        this.location = new CircuitLocation(data.Location);
    }
}
