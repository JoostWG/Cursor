import type { SupportsJson } from '../../../lib/utils';
import type { FastestLapTimeApiData } from '../http';
import type { FastestLapTimeJson } from '../types';

export class FastestLapTime implements SupportsJson<FastestLapTimeJson> {
    public readonly time: string;

    public constructor(data: FastestLapTimeApiData) {
        this.time = data.time;
    }

    public toJson(): FastestLapTimeJson {
        return {
            time: this.time,
        };
    }
}
