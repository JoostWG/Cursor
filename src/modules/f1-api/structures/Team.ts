import type { Api, ConstructorApiData } from '../http';
import type { TeamJson } from '../types';
import { Structure } from './Structure';

export class Team extends Structure<TeamJson> {
    public readonly id: string | null;
    public readonly url: string | null;
    public readonly name: string;
    public readonly nationality: string | null;

    public constructor(data: ConstructorApiData, api: Api) {
        super(api);

        this.id = data.constructorId ?? null;
        this.url = data.url ?? null;
        this.name = data.name;
        this.nationality = data.nationality ?? null;
    }

    public override toString(): string {
        return this.name;
    }

    public override toJson(): TeamJson {
        return {
            id: this.id,
            url: this.url,
            name: this.name,
            nationality: this.nationality,
        };
    }
}
