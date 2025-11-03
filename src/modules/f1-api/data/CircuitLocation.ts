import type { SupportsJson } from '../../../lib/utils';
import type { LocationApiData } from '../http';
import type { CircuitLocationJson } from '../types';

export class CircuitLocation implements SupportsJson<CircuitLocationJson> {
    public readonly latitude: number;
    public readonly longitude: number;
    public readonly locality: string;
    public readonly country: string;

    public constructor(data: LocationApiData) {
        this.latitude = Number(data.lat);
        this.longitude = Number(data.long);
        this.locality = data.locality;
        this.country = data.country;
    }

    public toJson(): CircuitLocationJson {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            locality: this.locality,
            country: this.country,
        };
    }
}
