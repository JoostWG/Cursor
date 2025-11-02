import type { Api, QualifyingResultApiData } from '../http';
import { Driver } from './Driver';
import { Structure } from './Structure';
import { Team } from './Team';

export class QualifyingResult extends Structure<QualifyingResultApiData> {
    public readonly number: number;
    public readonly position: number | null;
    public readonly driver: Driver;
    public readonly team: Team;
    public readonly q1: string | null;
    public readonly q2: string | null;
    public readonly q3: string | null;

    public constructor(data: QualifyingResultApiData, api: Api) {
        super(data, api);

        this.number = Number(data.number);
        this.position = data.position !== undefined ? Number(data.position) : null;
        this.driver = new Driver(data.Driver, this.api);

        this.team = new Team(data.Constructor, this.api);
        this.q1 = data.Q1 ?? null;
        this.q2 = data.Q2 ?? null;
        this.q3 = data.Q3 ?? null;
    }
}
