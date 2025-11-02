import type { Api } from '../http';

export class Structure<T> {
    protected constructor(protected readonly data: T, protected readonly api: Api) {
        //
    }

    protected getUrlBuilder<TBuilder, TArgs extends unknown[]>(
        builderClass: new (api: Api, ...args: TArgs) => TBuilder,
        ...args: TArgs
    ): TBuilder {
        return new builderClass(this.api, ...args);
    }
}
