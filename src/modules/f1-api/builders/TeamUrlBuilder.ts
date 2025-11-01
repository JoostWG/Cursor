import type { Api, ConstructorsResponse } from '../http';
import { Team } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class TeamUrlBuilder extends UrlBuilder<ConstructorsResponse, Team | null> {
    public constructor(api: Api, private readonly id: string) {
        super(api);
    }

    protected override path(): string {
        return `/constructors/${this.id}`;
    }

    protected override transformResponse(data: ConstructorsResponse): Team | null {
        return this.transformSingle(data.MRData.ConstructorTable.Constructors, Team);
    }
}
