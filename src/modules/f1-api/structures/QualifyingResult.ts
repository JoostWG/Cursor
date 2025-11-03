import type { Api, QualifyingResultApiData } from '../http';
import type { QualifyingResultJson } from '../types';
import { Driver } from './Driver';
import { Structure } from './Structure';
import { Team } from './Team';

export class QualifyingResult extends Structure<QualifyingResultJson> {
    public readonly number: number;
    public readonly position: number | null;
    public readonly driver: Driver;
    public readonly team: Team;
    public readonly q1: string | null;
    public readonly q2: string | null;
    public readonly q3: string | null;

    public constructor(data: QualifyingResultApiData, api: Api) {
        super(api);

        this.number = Number(data.number);
        this.position = data.position !== undefined ? Number(data.position) : null;
        this.driver = new Driver(data.Driver, this.api);

        this.team = new Team(data.Constructor, this.api);
        this.q1 = data.Q1 ?? null;
        this.q2 = data.Q2 ?? null;
        this.q3 = data.Q3 ?? null;
    }

    public override toJson(): QualifyingResultJson {
        return {
            number: this.number,
            position: this.position,
            driver: this.driver.toJson(),
            team: this.team.toJson(),
            q1: this.q1,
            q2: this.q2,
            q3: this.q3,
        };
    }
}
