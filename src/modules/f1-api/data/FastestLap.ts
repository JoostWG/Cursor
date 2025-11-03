import type { SupportsJson } from '../../../lib/utils';
import type { FastestLapApiData } from '../http';
import type { FastestLapJson } from '../types';
import { AverageSpeed } from './AverageSpeed';
import { FastestLapTime } from './FastestLapTime';

export class FastestLap implements SupportsJson<FastestLapJson> {
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

    public toJson(): FastestLapJson {
        return {
            rank: this.rank,
            lap: this.lap,
            time: this.time,
            averageSpeed: this.averageSpeed,
        };
    }
}
