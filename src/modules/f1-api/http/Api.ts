import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import {
    CircuitsUrlBuilder,
    ConstructorUrlBuilder,
    ConstructorsUrlBuilder,
    DriverUrlBuilder,
    DriversUrlBuilder,
    SeasonUrlBuilder,
} from '../builders';
import { BadRequest, HttpError, NotFound } from '../errors';
import type { BadRequestResponse, Pagination } from './types';

export class Api {
    private readonly api: AxiosInstance;

    public constructor() {
        this.api = axios.create({
            baseURL: 'https://api.jolpi.ca/ergast/f1',
            headers: new AxiosHeaders().setContentType('application/json'),
        });
    }

    public circuits(): CircuitsUrlBuilder {
        return new CircuitsUrlBuilder(this);
    }

    public constructors(): ConstructorsUrlBuilder {
        return new ConstructorsUrlBuilder(this);
    }

    // FIXME: Idk what to do here. Can't name it constructor ofc but idk. Maybe I should rename it to team and teams
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _constructor(id: string): ConstructorUrlBuilder {
        return new ConstructorUrlBuilder(this, id);
    }

    public drivers(): DriversUrlBuilder {
        return new DriversUrlBuilder(this);
    }

    public driver(id: string): DriverUrlBuilder {
        return new DriverUrlBuilder(this, id);
    }

    public season(year: string): SeasonUrlBuilder {
        return new SeasonUrlBuilder(this, year);
    }

    public async get<T>(path: string, pagination?: Pagination): Promise<T> {
        const response = await this.api.get<T | BadRequestResponse>(path, { params: pagination });

        if (response.status === 404) {
            throw new NotFound();
        }

        if (this.responseIsBadRequest(response)) {
            throw new BadRequest(response.data.detail);
        }

        if (response.status !== 200) {
            throw new HttpError(response.status);
        }

        return response.data as T;
    }

    private responseIsBadRequest(
        response: AxiosResponse,
    ): response is AxiosResponse<BadRequestResponse> {
        return response.status === 400;
    }
}
