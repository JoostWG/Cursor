import type { Api, Pagination, SuccessResponse } from '../http';

export interface UrlBuilderOptions {
    year?: string;
    round?: number;
}

export abstract class UrlBuilder<TResponse extends SuccessResponse, TData> {
    public constructor(
        protected readonly api: Api,
        private readonly options: UrlBuilderOptions = {},
    ) {
        //
    }

    public year(year: string): this {
        this.options.year = year;

        return this;
    }

    public round(round: number): this {
        this.options.round = round;

        return this;
    }

    public async get(
        ...[pagination]: TData extends unknown[] ? [pagination?: Pagination] : []
    ): Promise<TData> {
        return await this.api.get<TResponse>(this.getPath(), pagination)
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

    private getPath(): string {
        let path = '';

        if (this.options.year) {
            path += `/${this.options.year}`;

            if (this.options.round) {
                path += `/${this.options.round}`;
            }
        }

        return path + this.path();
    }

    protected abstract path(): string;
    protected abstract transformResponse(data: TResponse): TData;
}
