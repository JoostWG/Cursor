import type { RaceApiData, SuccessResponse } from '.';

export interface PitStopApiData {
    driverId: string;
    lap?: string;
    stop?: string;
    time?: string;
    duration?: string;
}

export type PitStopsResponse = SuccessResponse<{
    RaceTable: {
        Races: (RaceApiData & { PitStops: PitStopApiData[] })[];
    };
}>;
