import { CircuitLocation } from '../data';
import type { Api, CircuitApiData } from '../http';
import type { CircuitJson } from '../types';
import { Structure } from './Structure';

export class Circuit extends Structure<CircuitJson> {
    public readonly id: string;
    public readonly url: string;
    public readonly name: string;
    public readonly location: CircuitLocation;

    public constructor(data: CircuitApiData, api: Api) {
        super(api);

        this.id = data.circuitId;
        this.url = data.url;
        this.name = data.circuitName;
        this.location = new CircuitLocation(data.Location);
    }

    public override toString(): string {
        return `${this.name} - ${this.location.locality}, ${this.location.country}`;
    }

    public override toJson(): CircuitJson {
        return {
            id: this.id,
            url: this.url,
            name: this.name,
            location: this.location.toJson(),
        };
    }
}
