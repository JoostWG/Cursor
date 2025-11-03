import type { SupportsJson } from '../../../lib/utils';
import type { Api } from '../http';

export abstract class Structure<TJson = unknown> implements SupportsJson<TJson> {
    protected constructor(protected readonly api: Api) {
        //
    }

    protected getUrlBuilder<TBuilder, TArgs extends unknown[]>(
        builderClass: new (api: Api, ...args: TArgs) => TBuilder,
        ...args: TArgs
    ): TBuilder {
        return new builderClass(this.api, ...args);
    }

    public abstract toJson(): TJson;
}
