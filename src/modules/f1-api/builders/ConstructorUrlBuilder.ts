import type { Api, ConstructorsResponse } from '../http';
import { Constructor } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class ConstructorUrlBuilder extends UrlBuilder<ConstructorsResponse, Constructor | null> {
    public constructor(api: Api, private readonly id: string) {
        super(api);
    }

    protected override path(): string {
        return `/constructors/${this.id}`;
    }

    protected override transformResponse(data: ConstructorsResponse): Constructor | null {
        return data.MRData.ConstructorTable.Constructors.length > 0
            ? new Constructor(data.MRData.ConstructorTable.Constructors[0], this.api)
            : null;
    }
}
