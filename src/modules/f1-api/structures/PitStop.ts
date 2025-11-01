import type { Api, PitStopApiData } from '../http';
import { Model } from './Model';

export class PitStop extends Model<PitStopApiData> {
    public readonly driverId: string;
    public readonly lap: number | null;
    public readonly stop: number | null;
    public readonly time: string | null;
    public readonly duration: number | null;

    public constructor(data: PitStopApiData, api: Api) {
        super(data, api);

        this.driverId = data.driverId;
        this.lap = data.lap !== undefined ? Number(data.lap) : null;
        this.stop = data.stop !== undefined ? Number(data.stop) : null;
        this.time = data.time ?? null;
        this.duration = data.duration !== undefined ? Number(data.duration) : null;
    }
}
