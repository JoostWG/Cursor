import type { Api, Pagination, SuccessResponse } from '../http';

export abstract class UrlBuilder<TResponse extends SuccessResponse, TData> {
    protected constructor(public readonly api: Api) {
        //
    }

    public async get(
        ...[pagination]: TData extends unknown[] ? [pagination?: Pagination] : []
    ): Promise<TData> {
        return await this.api.get<TResponse>(this.path(), pagination)
            .then((data) => this.transformResponse(data));
    }

    protected transformMultiple<D, TStructure>(
        data: D[],
        structure: new (data: D, api: Api) => TStructure,
    ): TStructure[] {
        return data.map((item) => new structure(item, this.api));
    }

    protected transformSingle<D, TStructure>(
        data: D[],
        structure: new (data: D, api: Api) => TStructure,
    ): TStructure | null {
        return data.length > 0 ? new structure(data[0], this.api) : null;
    }

    protected abstract path(): string;
    protected abstract transformResponse(data: TResponse): TData;
}
