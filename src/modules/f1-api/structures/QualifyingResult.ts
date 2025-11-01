import type { Api, QualifyingResultApiData } from '../http';
import { Constructor } from './Constructor';
import { Driver } from './Driver';
import { Model } from './Model';

export class QualiyingResult extends Model<QualifyingResultApiData> {
    public readonly number: number;
    public readonly position: number | null;
    public readonly driver: Driver;
    // FIXME: Idk what to do here. Can't name it constructor ofc but idk. Maybe I should rename it to team and teams
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly _constructor: Constructor;
    public readonly q1: string | null;
    public readonly q2: string | null;
    public readonly q3: string | null;

    public constructor(data: QualifyingResultApiData, api: Api) {
        super(data, api);

        this.number = Number(data.number);
        this.position = data.position !== undefined ? Number(data.position) : null;
        this.driver = new Driver(data.Driver, this.api);
        // eslint-disable-next-line no-underscore-dangle
        this._constructor = new Constructor(data.Constructor, this.api);
        this.q1 = data.Q1 ?? null;
        this.q2 = data.Q2 ?? null;
        this.q3 = data.Q3 ?? null;
    }
}
