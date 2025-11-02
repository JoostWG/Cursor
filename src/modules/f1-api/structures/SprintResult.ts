import { FastestLap, FinishingTime } from '../data';
import type { Api, SprintResultApiData } from '../http';
import { Driver } from './Driver';
import { Structure } from './Structure';
import { Team } from './Team';

export class SprintResult extends Structure<SprintResultApiData> {
    public readonly number: number;
    public readonly position: string;
    public readonly positionText: string;
    public readonly points: number;
    public readonly driver: Driver;
    public readonly team: Team | null;
    public readonly grid: number | null;
    public readonly laps: number | null;
    public readonly status: string | null;
    public readonly finishingTime: FinishingTime | null;
    public readonly fastestLap: FastestLap | null;

    public constructor(data: SprintResultApiData, api: Api) {
        super(data, api);

        this.number = Number(data.number);
        this.position = data.position;
        this.positionText = data.positionText;
        this.points = Number(data.points);
        this.driver = new Driver(data.Driver, this.api);

        this.team = data.Constructor !== undefined
            ? new Team(data.Constructor, this.api)
            : null;
        this.grid = data.grid !== undefined ? Number(data.grid) : null;
        this.laps = data.laps !== undefined ? Number(data.laps) : null;
        this.status = data.status ?? null;
        this.finishingTime = data.Time !== undefined ? new FinishingTime(data.Time) : null;
        this.fastestLap = data.FastestLap !== undefined ? new FastestLap(data.FastestLap) : null;
    }
}
