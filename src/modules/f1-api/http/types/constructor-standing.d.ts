import type { SuccessResponse } from '.';
import type { ConstructorApiData } from './constructor';

export interface ConstructorStandingApiData {
    position?: string;
    positionText: string;
    points: string;
    wins: string;
    Constructor: ConstructorApiData;
}

export type ConstructorStandingsResponse = SuccessResponse<{
    StandingsTable: {
        StandingsLists: {
            ConstructorStandings: ConstructorStandingApiData[];
        }[];
    };
}>;
