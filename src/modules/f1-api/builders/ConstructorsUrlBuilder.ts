import type { Api, ConstructorsResponse } from '../http';
import { Constructor } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class ConstructorsUrlBuilder extends UrlBuilder<ConstructorsResponse, Constructor[]> {
    public constructor(api: Api) {
        super(api);
    }

    protected override path(): string {
        return `/constructors`;
    }

    protected override transformResponse(data: ConstructorsResponse): Constructor[] {
        return data.MRData.ConstructorTable.Constructors.map((constructor) =>
            new Constructor(constructor, this.api)
        );
    }
}
