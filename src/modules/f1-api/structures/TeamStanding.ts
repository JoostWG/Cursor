import type { Api, ConstructorStandingApiData } from '../http';
import type { TeamStandingJson } from '../types';
import { Structure } from './Structure';
import { Team } from './Team';

export class TeamStanding extends Structure<TeamStandingJson> {
    public readonly position: string | null;
    public readonly positionText: string;
    public readonly points: number;
    public readonly wins: number;
    public readonly team: Team;

    public constructor(data: ConstructorStandingApiData, api: Api) {
        super(api);

        this.position = data.position ?? null;
        this.positionText = data.positionText;
        this.points = Number(data.points);
        this.wins = Number(data.wins);
        this.team = new Team(data.Constructor, this.api);
    }

    public override toJson(): TeamStandingJson {
        return {
            position: this.position,
            positionText: this.positionText,
            points: this.points,
            wins: this.wins,
            team: this.team.toJson(),
        };
    }
}
