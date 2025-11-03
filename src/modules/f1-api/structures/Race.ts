import { SessionDateTime } from '../data';
import type { Api, RaceApiData } from '../http';
import type { RaceJson } from '../types';
import { Circuit } from './Circuit';
import { Structure } from './Structure';

export class Race extends Structure<RaceJson> {
    public readonly season: string;
    public readonly round: number;
    public readonly url: string | null;
    public readonly name: string;
    public readonly circuit: Circuit;
    public readonly date: string;
    public readonly time: string | null;
    public readonly firstPractice: SessionDateTime | null;
    public readonly secondPractice: SessionDateTime | null;
    public readonly thirdPractice: SessionDateTime | null;
    public readonly qualifying: SessionDateTime | null;
    public readonly sprint: SessionDateTime | null;
    public readonly sprintQualifying: SessionDateTime | null;
    public readonly sprintShootout: SessionDateTime | null;

    public constructor(data: RaceApiData, api: Api) {
        super(api);

        this.season = data.season;
        this.round = Number(data.round);
        this.url = data.url ?? null;
        this.name = data.raceName;
        this.circuit = new Circuit(data.Circuit, this.api);
        this.date = data.date;
        this.time = data.time ?? null;
        this.firstPractice = data.FirstPractice !== undefined
            ? new SessionDateTime(data.FirstPractice)
            : null;
        this.secondPractice = data.SecondPractice !== undefined
            ? new SessionDateTime(data.SecondPractice)
            : null;
        this.thirdPractice = data.ThirdPractice !== undefined
            ? new SessionDateTime(data.ThirdPractice)
            : null;
        this.qualifying = data.Qualifying !== undefined
            ? new SessionDateTime(data.Qualifying)
            : null;
        this.sprint = data.Sprint !== undefined
            ? new SessionDateTime(data.Sprint)
            : null;
        this.sprintQualifying = data.SprintQualifying !== undefined
            ? new SessionDateTime(data.SprintQualifying)
            : null;
        this.sprintShootout = data.SprintShootout !== undefined
            ? new SessionDateTime(data.SprintShootout)
            : null;
    }

    public override toString(): string {
        return `${this.season} ${this.name}`;
    }

    public override toJson(): RaceJson {
        return {
            season: this.season,
            round: this.round,
            url: this.url,
            name: this.name,
            circuit: this.circuit.toJson(),
            date: this.date,
            time: this.time,
            firstPractice: this.firstPractice?.toJson() ?? null,
            secondPractice: this.secondPractice?.toJson() ?? null,
            thirdPractice: this.thirdPractice?.toJson() ?? null,
            qualifying: this.qualifying?.toJson() ?? null,
            sprint: this.sprint?.toJson() ?? null,
            sprintQualifying: this.sprintQualifying?.toJson() ?? null,
            sprintShootout: this.sprintShootout?.toJson() ?? null,
        };
    }
}
