import { LapTiming } from '../data';
import type { Api, LapApiData } from '../http';
import type { LapJson } from '../types';
import { Structure } from './Structure';

export class Lap extends Structure<LapJson> {
    public readonly number: number;
    public readonly timings: readonly LapTiming[];

    public constructor(data: LapApiData, api: Api) {
        super(api);

        this.number = Number(data.number);
        this.timings = data.Timings.map((timing) => new LapTiming(timing));
    }

    public override toJson(): LapJson {
        return {
            number: this.number,
            timings: this.timings.map(timing => timing.toJson()),
        };
    }
}
