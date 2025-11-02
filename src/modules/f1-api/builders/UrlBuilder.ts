import type { StatusType } from '../enums';
import type { Api, Pagination, SuccessResponse } from '../http';

export interface UrlBuilderOptions {
    year?: 'current' | (string & {});
    round?: number | 'last' | 'next';
    circuitId?: string;
    driverId?: string;
    teamId?: string;
    lap?: number;
    pitStopNumber?: number;
    fastestRank?: number;
    gridPosition?: number;
    finishPosition?: number;
    status?: StatusType;
}

export abstract class UrlBuilder<TResponse extends SuccessResponse, TData> {
    public constructor(
        private readonly api: Api,
        protected readonly options: UrlBuilderOptions = {},
    ) {
        //
    }

    public async get(
        ...[pagination]: TData extends unknown[] ? [pagination?: Pagination] : []
    ): Promise<TData> {
        return await this.api.get<TResponse>(this.getPath(), pagination)
            .then((data) => this.transformResponse(data));
    }

    protected setOption<K extends keyof UrlBuilderOptions>(
        option: K,
        value: UrlBuilderOptions[K],
    ): this {
        this.options[option] = value;

        return this;
    }

    protected builder<T extends UrlBuilder<SuccessResponse, unknown>>(
        builderClass: new (api: Api, options: UrlBuilderOptions) => T,
    ): T {
        return new builderClass(this.api, this.builderOptions());
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

    protected path(): string {
        return '';
    }

    protected builderOptions(): UrlBuilderOptions {
        return this.options;
    }

    private getPath(): string {
        const path: string[] = [];

        if (this.options.year) {
            path.push(this.options.year);

            if (this.options.round) {
                path.push(String(this.options.round));
            }
        }

        if (this.options.circuitId) {
            path.push('circuits', this.options.circuitId);
        }

        if (this.options.driverId) {
            path.push('drivers', this.options.driverId);
        }

        if (this.options.teamId) {
            path.push('constructors', this.options.teamId);
        }

        if (this.options.lap) {
            path.push('laps', String(this.options.lap));
        }

        if (this.options.pitStopNumber) {
            path.push('pitstops', String(this.options.pitStopNumber));
        }

        if (this.options.fastestRank) {
            path.push('fastest', String(this.options.fastestRank));
        }

        if (this.options.gridPosition) {
            path.push('grid', String(this.options.gridPosition));
        }

        if (this.options.finishPosition) {
            path.push('results', String(this.options.finishPosition));
        }

        if (this.options.status) {
            path.push('status', this.options.status);
        }

        if (path.length === 0) {
            return this.path();
        }

        return `/${path.join('/')}${this.path()}`;
    }

    protected abstract transformResponse(data: TResponse): TData;
}
