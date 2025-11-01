import type { Api, DriverStandingApiData } from '../http';
import { Constructor } from './Constructor';
import { Driver } from './Driver';
import { Model } from './Model';

export class DriverStanding extends Model<DriverStandingApiData> {
    public readonly position: number | null;
    public readonly positionText: string;
    public readonly points: number;
    public readonly wins: number;
    public readonly driver: Driver;
    public readonly constructors: readonly Constructor[];

    public constructor(data: DriverStandingApiData, api: Api) {
        super(data, api);

        this.position = data.position !== undefined ? Number(data.position) : null;
        this.positionText = data.positionText;
        this.points = Number(data.points);
        this.wins = Number(data.wins);
        this.driver = new Driver(data.Driver, this.api);
        this.constructors = data.Constructors.map((constructor) =>
            new Constructor(constructor, this.api)
        );
    }
}
