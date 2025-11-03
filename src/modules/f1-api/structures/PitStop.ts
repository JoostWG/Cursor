import type { Api, PitStopApiData } from '../http';
import type { PitStopJson } from '../types';
import { Structure } from './Structure';

export class PitStop extends Structure<PitStopJson> {
    public readonly driverId: string;
    public readonly lap: number | null;
    public readonly stop: number | null;
    public readonly time: string | null;
    public readonly duration: number | null;

    public constructor(data: PitStopApiData, api: Api) {
        super(api);

        this.driverId = data.driverId;
        this.lap = data.lap !== undefined ? Number(data.lap) : null;
        this.stop = data.stop !== undefined ? Number(data.stop) : null;
        this.time = data.time ?? null;
        this.duration = data.duration !== undefined ? Number(data.duration) : null;
    }

    public override toJson(): PitStopJson {
        return {
            driverId: this.driverId,
            lap: this.lap,
            stop: this.stop,
            time: this.time,
            duration: this.duration,
        };
    }
}
