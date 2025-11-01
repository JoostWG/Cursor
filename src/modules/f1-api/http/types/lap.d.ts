import type { RaceApiData, SuccessResponse } from '.';

export interface TimingApiData {
    driverId: string;
    position: string;
    time: string;
}

export interface LapApiData {
    number: string;
    Timings: TimingApiData[];
}

export type LapsApiResponse = SuccessResponse<{
    RaceTable: {
        Races: (RaceApiData & { Laps: LapApiData[] })[];
    };
}>;
