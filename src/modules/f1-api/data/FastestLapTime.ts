import type { FastestLapTimeApiData } from '../http/types/result';

export class FastestLapTime {
    public readonly time: string;

    public constructor(data: FastestLapTimeApiData) {
        this.time = data.time;
    }
}
