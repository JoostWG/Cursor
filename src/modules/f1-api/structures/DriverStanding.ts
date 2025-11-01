import type { Api, DriverStandingApiData } from '../http';
import { Driver } from './Driver';
import { Model } from './Model';
import { Team } from './Team';

export class DriverStanding extends Model<DriverStandingApiData> {
    public readonly position: number | null;
    public readonly positionText: string;
    public readonly points: number;
    public readonly wins: number;
    public readonly driver: Driver;
    public readonly teams: readonly Team[];

    public constructor(data: DriverStandingApiData, api: Api) {
        super(data, api);

        this.position = data.position !== undefined ? Number(data.position) : null;
        this.positionText = data.positionText;
        this.points = Number(data.points);
        this.wins = Number(data.wins);
        this.driver = new Driver(data.Driver, this.api);
        this.teams = data.Constructors.map((team) => new Team(team, this.api));
    }
}
