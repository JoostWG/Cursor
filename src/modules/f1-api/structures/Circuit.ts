import { CircuitLocation } from '../data';
import type { Api, CircuitApiData } from '../http';
import { Structure } from './Structure';

export class Circuit extends Structure<CircuitApiData> {
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

    public override toString(): string {
        return `${this.name} - ${this.location.locality}, ${this.location.country}`;
    }
}
