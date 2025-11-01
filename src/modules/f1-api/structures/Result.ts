import type { FastestLap } from '../data';
import type { ResultApiData } from '../http';
import type { Constructor } from './Constructor';
import type { Driver } from './Driver';
import { Model } from './Model';

export class Result extends Model<ResultApiData> {
    public readonly number: number;
    public readonly position: string;
    public readonly positionText: string;
    public readonly points: number;
    public readonly driver: Driver;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly _constructor: Constructor | null;
    public readonly grid: string | null;
    public readonly laps: number | null;
    public readonly status: string | null;
    public readonly fastestLap: FastestLap;

    public constructor(data: ResultApiData, api: Api) {
        // TODO: fill properties
    }
}
