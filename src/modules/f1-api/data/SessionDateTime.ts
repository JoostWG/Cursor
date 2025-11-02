import type { DateTimeApiData } from '../http';

export class SessionDateTime {
    public readonly date: string | null;
    public readonly time: string | null;

    public constructor(data: DateTimeApiData) {
        this.date = data.date ?? null;
        this.time = data.time ?? null;
    }
}
