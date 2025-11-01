import type { Api, ConstructorStandingApiData } from '../http';
import { Model } from './Model';
import { Team } from './Team';

export class TeamStanding extends Model<ConstructorStandingApiData> {
    public readonly position: string | null;
    public readonly positionText: string;
    public readonly points: number;
    public readonly wins: number;
    public readonly team: Team;

    public constructor(data: ConstructorStandingApiData, api: Api) {
        super(data, api);

        this.position = data.position ?? null;
        this.positionText = data.positionText;
        this.points = Number(data.points);
        this.wins = Number(data.wins);
        this.team = new Team(data.Constructor, this.api);
    }
}
