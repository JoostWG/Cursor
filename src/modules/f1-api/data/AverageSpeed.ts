import type { SupportsJson } from '../../../lib/utils';
import type { AverageSpeedApiData } from '../http';
import type { AverageSpeedJson } from '../types';

export class AverageSpeed implements SupportsJson<AverageSpeedJson> {
    public readonly units: string;
    public readonly speed: number;

    public constructor(data: AverageSpeedApiData) {
        this.units = data.units;
        this.speed = Number(data.speed);
    }

    public toJson(): AverageSpeedJson {
        return {
            units: this.units,
            speed: this.speed,
        };
    }
}
