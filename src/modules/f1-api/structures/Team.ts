import type { Api, ConstructorApiData } from '../http';
import { Structure } from './Structure';

export class Team extends Structure<ConstructorApiData> {
    public readonly id: string | null;
    public readonly url: string | null;
    public readonly name: string;
    public readonly nationality: string | null;

    public constructor(data: ConstructorApiData, api: Api) {
        super(data, api);

        this.id = data.constructorId ?? null;
        this.url = data.url ?? null;
        this.name = data.name;
        this.nationality = data.nationality ?? null;
    }

    public override toString(): string {
        return this.name;
    }
}
