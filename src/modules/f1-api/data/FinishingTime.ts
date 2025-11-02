import type { FinishingTimeApiData } from '../http';

export class FinishingTime {
    public readonly millis: number;
    public readonly time: string;

    public constructor(data: FinishingTimeApiData) {
        this.millis = Number(data.millis);
        this.time = data.time;
    }
}
