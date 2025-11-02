import type { SuccessResponse } from '.';
import type { ConstructorApiData } from './constructor';
import type { DriverApiData } from './driver';

export interface DriverStandingApiData {
    position?: string;
    positionText: string;
    points: string;
    wins: string;
    Driver: DriverApiData;
    Constructors: ConstructorApiData[];
}

export type DriverStandingsResponse = SuccessResponse<{
    StandingsTable: {
        StandingsLists: {
            DriverStandings: DriverStandingApiData[];
        }[];
    };
}>;
