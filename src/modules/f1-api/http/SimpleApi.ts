import type { StatusType } from '../enums';
import {
    Circuit,
    Driver,
    DriverStanding,
    Lap,
    PitStop,
    QualifyingResult,
    Race,
    Result,
    Season,
    SprintResult,
    Team,
    TeamStanding,
} from '../structures';
import { Api } from './Api';
import type {
    CircuitsResponse,
    ConstructorStandingsResponse,
    ConstructorsResponse,
    DriverStandingsResponse,
    DriversResponse,
    LapsResponse,
    Pagination,
    PitStopsResponse,
    QualifyingResultsResponse,
    RacesResponse,
    ResultsResponse,
    SeasonsResponse,
    SprintResultsResponse,
    StatusesResponse,
} from './types';

export interface SeasonOption {
    season?: 'current' | (string & {});
}

export interface RoundOption {
    round?: number | 'last' | 'next';
}

export interface CircuitOption {
    circuit?: string;
}

export interface DriverOption {
    driver?: string;
}

export interface TeamOption {
    team?: string;
}

export interface LapOption {
    lap?: number;
}

export interface PitStopOption {
    pitStopNumber?: number;
}

export interface FastestRankOption {
    fastestRank?: number;
}

export interface GridPositionOption {
    gridPosition?: number;
}

export interface FinishPositionOption {
    finishPosition?: number;
}

export type SimpleApiOptions =
    & SeasonOption
    & RoundOption
    & CircuitOption
    & DriverOption
    & TeamOption
    & LapOption
    & PitStopOption
    & FastestRankOption
    & GridPositionOption
    & FinishPositionOption
    & StatusOption;

export interface StatusOption {
    status?: StatusType;
}

export interface ResponsesMap {
    circuits: CircuitsResponse;
    constructorstandings: ConstructorStandingsResponse;
    constructors: ConstructorsResponse;
    driverstandings: DriverStandingsResponse;
    drivers: DriversResponse;
    laps: LapsResponse;
    pitstops: PitStopsResponse;
    qualifying: QualifyingResultsResponse;
    races: RacesResponse;
    results: ResultsResponse;
    seasons: SeasonsResponse;
    sprint: SprintResultsResponse;
    status: StatusesResponse;
}

export interface Response<T> {
    meta: {
        limit: number;
        offset: number;
        total: number;
    };
    data: T;
}

export class SimpleApi extends Api {
    public async getCircuits(
        options?:
            & SeasonOption
            & RoundOption
            & DriverOption
            & FastestRankOption
            & GridPositionOption
            & FinishPositionOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<Circuit[]>> {
        return await this.getWithOptions(
            'circuits',
            (data) =>
                data.MRData.CircuitTable.Circuits.map((circuit) => new Circuit(circuit, this)),
            options,
            pagination,
        );
    }

    public async getDriverStandings(
        options: Required<SeasonOption> & RoundOption & DriverOption,
        pagination?: Pagination,
    ): Promise<Response<DriverStanding[]>> {
        return await this.getWithOptions(
            'driverstandings',
            (data) =>
                data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map((driverStanding) =>
                    new DriverStanding(driverStanding, this)
                ),
            options,
            pagination,
        );
    }

    public async getDrivers(
        options?:
            & SeasonOption
            & RoundOption
            & CircuitOption
            & FastestRankOption
            & GridPositionOption
            & FinishPositionOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<Driver[]>> {
        return await this.getWithOptions(
            'drivers',
            (data) => data.MRData.DriverTable.Drivers.map((driver) => new Driver(driver, this)),
            options,
            pagination,
        );
    }

    public async getLaps(
        options?:
            & Required<SeasonOption>
            & Required<RoundOption>
            & DriverOption
            & LapOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<Lap[]>> {
        return await this.getWithOptions(
            'laps',
            (data) => data.MRData.RaceTable.Races[0].Laps.map((lap) => new Lap(lap, this)),
            options,
            pagination,
        );
    }

    public async getPitStops(
        options?:
            & Required<SeasonOption>
            & Required<RoundOption>
            & DriverOption
            & LapOption
            & PitStopOption,
        pagination?: Pagination,
    ): Promise<Response<PitStop[]>> {
        return await this.getWithOptions(
            'pitstops',
            (data) =>
                data.MRData.RaceTable.Races[0].PitStops.map((pitStop) =>
                    new PitStop(pitStop, this)
                ),
            options,
            pagination,
        );
    }

    public async getQualifyingResults(
        options?:
            & SeasonOption
            & RoundOption
            & CircuitOption
            & DriverOption
            & GridPositionOption
            & FastestRankOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<QualifyingResult[]>> {
        return await this.getWithOptions(
            'qualifying',
            (data) =>
                data.MRData.RaceTable.Races[0].QualifyingResults.map((qualifyingResult) =>
                    new QualifyingResult(qualifyingResult, this)
                ),
            options,
            pagination,
        );
    }

    public async getRaces(
        options?:
            & SeasonOption
            & RoundOption
            & CircuitOption
            & DriverOption
            & FinishPositionOption
            & GridPositionOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<Race[]>> {
        return await this.getWithOptions(
            'races',
            (data) => data.MRData.RaceTable.Races.map((race) => new Race(race, this)),
            options,
            pagination,
        );
    }

    public async getResults(
        options?:
            & SeasonOption
            & RoundOption
            & CircuitOption
            & DriverOption
            & FastestRankOption
            & GridPositionOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<Result[]>> {
        return await this.getWithOptions(
            'results',
            (data) =>
                data.MRData.RaceTable.Races[0].Results.map((result) => new Result(result, this)),
            options,
            pagination,
        );
    }

    public async getSeasons(
        options?:
            & CircuitOption
            & DriverOption
            & GridPositionOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<Season[]>> {
        return await this.getWithOptions(
            'seasons',
            (data) => data.MRData.SeasonTable.Seasons.map((season) => new Season(season, this)),
            options,
            pagination,
        );
    }

    public async getSprintResults(
        options?:
            & CircuitOption
            & DriverOption
            & GridPositionOption
            & StatusOption
            & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<SprintResult[]>> {
        return await this.getWithOptions(
            'sprint',
            (data) =>
                data.MRData.RaceTable.Races[0].SprintResults.map((sprintResult) =>
                    new SprintResult(sprintResult, this)
                ),
            options,
            pagination,
        );
    }

    public async getTeamStandings(
        options: Required<SeasonOption> & RoundOption & TeamOption,
        pagination?: Pagination,
    ): Promise<Response<TeamStanding[]>> {
        return await this.getWithOptions(
            'constructorstandings',
            (data) =>
                data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map((
                    teamStanding,
                ) => new TeamStanding(teamStanding, this)),
            options,
            pagination,
        );
    }

    public async getTeams(
        options?:
            & SeasonOption
            & RoundOption
            & CircuitOption
            & FastestRankOption
            & GridPositionOption
            & FinishPositionOption
            & StatusOption,
        pagination?: Pagination,
    ): Promise<Response<Team[]>> {
        return await this.getWithOptions(
            'constructors',
            (data) => data.MRData.ConstructorTable.Constructors.map((team) => new Team(team, this)),
            options,
            pagination,
        );
    }

    // eslint-disable-next-line @typescript-eslint/max-params
    private async getWithOptions<K extends keyof ResponsesMap, R>(
        path: K,
        transform: (data: ResponsesMap[K]) => R,
        options?: SimpleApiOptions,
        pagination?: Pagination,
    ): Promise<Response<R>> {
        const response = await this.get<ResponsesMap[K]>(
            this.getPath(`/${path}`, options ?? {}),
            pagination,
        );

        return {
            meta: {
                limit: Number(response.MRData.limit),
                offset: Number(response.MRData.offset),
                total: Number(response.MRData.total),
            },
            data: transform(response),
        };
    }

    private getPath(basePath: string, options: SimpleApiOptions): string {
        const path: string[] = [];

        if (options.season) {
            path.push(options.season);

            if (options.round) {
                path.push(String(options.round));
            }
        }

        if (options.circuit) {
            path.push('circuits', options.circuit);
        }

        if (options.driver) {
            path.push('drivers', options.driver);
        }

        if (options.team) {
            path.push('constructors', options.team);
        }

        if (options.lap) {
            path.push('laps', String(options.lap));
        }

        if (options.pitStopNumber) {
            path.push('pitstops', String(options.pitStopNumber));
        }

        if (options.fastestRank) {
            path.push('fastest', String(options.fastestRank));
        }

        if (options.gridPosition) {
            path.push('grid', String(options.gridPosition));
        }

        if (options.finishPosition) {
            path.push('results', String(options.finishPosition));
        }

        if (options.status) {
            path.push('status', options.status);
        }

        if (path.length === 0) {
            return basePath;
        }

        return `/${path.join('/')}${basePath}`;
    }
}
