import type { SupportsJson } from '../../../lib/utils';
import type { DateTimeApiData } from '../http';
import type { SessionDateTimeJson } from '../types';

export class SessionDateTime implements SupportsJson<SessionDateTimeJson> {
    public readonly date: string | null;
    public readonly time: string | null;

    public constructor(data: DateTimeApiData) {
        this.date = data.date ?? null;
        this.time = data.time ?? null;
    }

    public toJson(): SessionDateTimeJson {
        return {
            date: this.date,
            time: this.time,
        };
    }
}
