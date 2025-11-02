import type { FastestLapApiData } from '../http';
import { AverageSpeed } from './AverageSpeed';
import { FastestLapTime } from './FastestLapTime';

export class FastestLap {
    public readonly rank: number;
    public readonly lap: number;
    public readonly time: FastestLapTime;
    public readonly averageSpeed: AverageSpeed;

    public constructor(data: FastestLapApiData) {
        this.rank = Number(data.rank);
        this.lap = Number(data.lap);
        this.time = new FastestLapTime(data.Time);
        this.averageSpeed = new AverageSpeed(data.AverageSpeed);
    }
}
