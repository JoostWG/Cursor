import type { FastestLapTimeApiData } from '../http';

export class FastestLapTime {
    public readonly time: string;

    public constructor(data: FastestLapTimeApiData) {
        this.time = data.time;
    }
}
