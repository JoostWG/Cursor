import { LapTiming } from '../data';
import type { Api, LapApiData } from '../http';
import { Model } from './Model';

export class Lap extends Model<LapApiData> {
    public readonly number: number;
    public readonly timings: readonly LapTiming[];

    public constructor(data: LapApiData, api: Api) {
        super(data, api);

        this.number = Number(data.number);
        this.timings = data.Timings.map((timing) => new LapTiming(timing));
    }
}
