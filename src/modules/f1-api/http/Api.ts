import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import {
    CircuitUrlBuilder,
    CircuitsUrlBuilder,
    DriverUrlBuilder,
    DriversUrlBuilder,
    RaceUrlBuilder,
    RacesUrlBuilder,
    ResultsUrlBuilder,
    SeasonUrlBuilder,
    SeasonsUrlBuilder,
    SprintResultsUrlBuilder,
    StatusUrlBuilder,
    StatusesUrlBuilder,
    TeamUrlBuilder,
    TeamsUrlBuilder,
} from '../builders';
import { BadRequest, HttpError, NotFound } from '../errors';
import type { BadRequestResponse, Pagination, SuccessResponse } from './types';

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

    public circuit(id: string): CircuitUrlBuilder {
        return new CircuitUrlBuilder(this, id);
    }

    public drivers(): DriversUrlBuilder {
        return new DriversUrlBuilder(this);
    }

    public driver(id: string): DriverUrlBuilder {
        return new DriverUrlBuilder(this, id);
    }

    public races(): RacesUrlBuilder {
        return new RacesUrlBuilder(this);
    }

    public race(year: string, round: number): RaceUrlBuilder {
        return new RaceUrlBuilder(this, year, round);
    }

    public results(): ResultsUrlBuilder {
        return new ResultsUrlBuilder(this);
    }

    public seasons(): SeasonsUrlBuilder {
        return new SeasonsUrlBuilder(this);
    }

    public season(year: string): SeasonUrlBuilder {
        return new SeasonUrlBuilder(this, year);
    }

    public sprintResults(): SprintResultsUrlBuilder {
        return new SprintResultsUrlBuilder(this);
    }

    public statuses(): StatusesUrlBuilder {
        return new StatusesUrlBuilder(this);
    }

    public status(id: number): StatusUrlBuilder {
        return new StatusUrlBuilder(this, id);
    }

    public teams(): TeamsUrlBuilder {
        return new TeamsUrlBuilder(this);
    }

    public team(id: string): TeamUrlBuilder {
        return new TeamUrlBuilder(this, id);
    }

    public async get<T extends SuccessResponse>(path: string, pagination?: Pagination): Promise<T> {
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
