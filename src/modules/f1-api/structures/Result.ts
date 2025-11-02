import { FastestLap, FinishingTime } from '../data';
import type { Api, ResultApiData } from '../http';
import { Driver } from './Driver';
import { Structure } from './Structure';
import { Team } from './Team';

export class Result extends Structure<ResultApiData> {
    public readonly number: number;
    public readonly position: string;
    public readonly positionText: string;
    public readonly points: number;
    public readonly driver: Driver;
    public readonly team: Team | null;
    public readonly grid: number | null;
    public readonly laps: number | null;
    public readonly status: string | null;
    public readonly fastestLap: FastestLap;
    public readonly finishingTime: FinishingTime | null;

    public constructor(data: ResultApiData, api: Api) {
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
        this.fastestLap = new FastestLap(data.FastestLap);
        this.finishingTime = data.Time !== undefined ? new FinishingTime(data.Time) : null;
    }
}
