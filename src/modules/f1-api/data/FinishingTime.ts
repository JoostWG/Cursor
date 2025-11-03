import type { SupportsJson } from '../../../lib/utils';
import type { FinishingTimeApiData } from '../http';
import type { FinishingTimeJson } from '../types';

export class FinishingTime implements SupportsJson<FinishingTimeJson> {
    public readonly milliseconds: number;
    public readonly time: string;

    public constructor(data: FinishingTimeApiData) {
        this.milliseconds = Number(data.millis);
        this.time = data.time;
    }

    public toJson(): FinishingTimeJson {
        return {
            milliseconds: this.milliseconds,
            time: this.time,
        };
    }
}
