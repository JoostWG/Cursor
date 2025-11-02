import type { RaceApiData, SuccessResponse } from '.';
import type { FastestLapApiData, FinishingTimeApiData } from './common';
import type { ConstructorApiData } from './constructor';
import type { DriverApiData } from './driver';

export interface ResultApiData {
    number: string;
    position: string;
    positionText: string;
    points: string;
    Driver: DriverApiData;
    Constructor?: ConstructorApiData;
    grid?: string;
    laps?: string;
    status?: string;
    FastestLap: FastestLapApiData;
    Time?: FinishingTimeApiData;
}

export type ResultsResponse = SuccessResponse<{
    RaceTable: {
        Races: (RaceApiData & {
            Results: ResultApiData[];
        })[];
    };
}>;
