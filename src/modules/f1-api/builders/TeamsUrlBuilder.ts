import type { Api, ConstructorsResponse } from '../http';
import { Team } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class TeamsUrlBuilder extends UrlBuilder<ConstructorsResponse, Team[]> {
    public constructor(api: Api) {
        super(api);
    }

    protected override path(): string {
        return `/constructors`;
    }

    protected override transformResponse(data: ConstructorsResponse): Team[] {
        return this.transformMultiple(data.MRData.ConstructorTable.Constructors, Team);
    }
}
