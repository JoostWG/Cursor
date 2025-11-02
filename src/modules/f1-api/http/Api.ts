import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import {
    CircuitsUrlBuilder,
    DriverStandingsUrlBuilder,
    DriversUrlBuilder,
    PitStopsUrlBuilder,
    RacesUrlBuilder,
    ResultsUrlBuilder,
    SeasonUrlBuilder,
    SeasonsUrlBuilder,
    SprintResultsUrlBuilder,
    StatusesUrlBuilder,
    TeamStandingsUrlBuilder,
    TeamsUrlBuilder,
    type UrlBuilderOptions,
} from '../builders';
import { BadRequest, HttpError, NotFound } from '../errors';
import type { ApiCache } from './ApiCache';
import type { BadRequestResponse, Pagination, SuccessResponse } from './types';

export class Api {
    private readonly axios: AxiosInstance;

    public constructor(private readonly cache?: ApiCache) {
        this.axios = axios.create({
            baseURL: 'https://api.jolpi.ca/ergast/f1',
            headers: new AxiosHeaders().setContentType('application/json'),
        });
    }

    // Multiple

    public circuits(): CircuitsUrlBuilder {
        return new CircuitsUrlBuilder(this);
    }

    public driverStandings(): DriverStandingsUrlBuilder {
        return new DriverStandingsUrlBuilder(this);
    }

    public drivers(): DriversUrlBuilder {
        return new DriversUrlBuilder(this);
    }

    public pitStops(): PitStopsUrlBuilder {
        return new PitStopsUrlBuilder(this);
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

    // Single

    public season(year: UrlBuilderOptions['year']): SeasonUrlBuilder {
        return new SeasonUrlBuilder(this, year);
    }

    public async get<T extends SuccessResponse>(path: string, pagination?: Pagination): Promise<T> {
        if (this.cache) {
            const data = await this.cache.get<T>(path, pagination);

            if (data !== null) {
                return data;
            }
        }

        const response = await this.axios.get<T | BadRequestResponse>(`${path}.json`, {
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

        const data = response.data as T;

        if (this.cache) {
            await this.cache.set(data, path, pagination);
        }

        return data;
    }

    private responseIsBadRequest(
        response: AxiosResponse,
    ): response is AxiosResponse<BadRequestResponse> {
        return response.status === 400;
    }
}
