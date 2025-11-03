import type { SupportsJson } from '../../../lib/utils';
import type { TimingApiData } from '../http';
import type { LapTimingJson } from '../types';

export class LapTiming implements SupportsJson<LapTimingJson> {
    public readonly driverId: string;
    public readonly position: number;
    public readonly time: string;

    public constructor(data: TimingApiData) {
        this.driverId = data.driverId;
        this.position = Number(data.position);
        this.time = data.time;
    }

    public toJson(): LapTimingJson {
        return {
            driverId: this.driverId,
            position: this.position,
            time: this.time,
        };
    }
}
