import type { AverageSpeedApiData } from '../http/types/result';

export class AverageSpeed {
    public readonly units: string;
    public readonly speed: number;

    public constructor(data: AverageSpeedApiData) {
        this.units = data.units;
        this.speed = Number(data.speed);
    }
}
