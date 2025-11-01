import type { ConstructorsResponse } from '../http';
import { Team } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class TeamsUrlBuilder extends UrlBuilder<ConstructorsResponse, Team[]> {
    protected override path(): string {
        return `/constructors`;
    }

    protected override transformResponse(data: ConstructorsResponse): Team[] {
        return this.transformMultiple(data.MRData.ConstructorTable.Constructors, Team);
    }
}
