import type { Api, Pagination } from '../http';

export abstract class UrlBuilder<TResponse, TData> {
    protected constructor(public readonly api: Api) {
        //
    }

    public async get(
        ...[pagination]: TData extends unknown[] ? [pagination?: Pagination] : []
    ): Promise<TData> {
        return await this.api.get<TResponse>(this.path(), pagination)
            .then((data) => this.transformResponse(data));
    }

    protected abstract path(): string;
    protected abstract transformResponse(data: TResponse): TData;
}
