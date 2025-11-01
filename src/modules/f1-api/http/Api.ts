import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import {
    CircuitsUrlBuilder,
    DriversUrlBuilder,
    RacesUrlBuilder,
    ResultsUrlBuilder,
    SeasonsUrlBuilder,
    SprintResultsUrlBuilder,
    StatusesUrlBuilder,
    TeamStandingsUrlBuilder,
    TeamsUrlBuilder,
} from '../builders';
import { DriverStandingsUrlBuilder } from '../builders/DriverStandingsUrlBuilder';
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

    public driverStandings(): DriverStandingsUrlBuilder {
        return new DriverStandingsUrlBuilder(this);
    }

    public drivers(): DriversUrlBuilder {
        return new DriversUrlBuilder(this);
    }

    public races(): RacesUrlBuilder {
        return new RacesUrlBuilder(this);
    }

    public results(): ResultsUrlBuilder {
        return new ResultsUrlBuilder(this);
    }

    public seasons(): SeasonsUrlBuilder {
        return new SeasonsUrlBuilder(this);
    }

    public sprintResults(): SprintResultsUrlBuilder {
        return new SprintResultsUrlBuilder(this);
    }

    public statuses(): StatusesUrlBuilder {
        return new StatusesUrlBuilder(this);
    }

    public teamStandings(): TeamStandingsUrlBuilder {
        return new TeamStandingsUrlBuilder(this);
    }

    public teams(): TeamsUrlBuilder {
        return new TeamsUrlBuilder(this);
    }

    public async get<T extends SuccessResponse>(path: string, pagination?: Pagination): Promise<T> {
        const response = await this.api.get<T | BadRequestResponse>(`${path}.json`, {
            params: pagination,
        });

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
