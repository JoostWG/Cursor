import type { SuccessResponse } from '.';
import type { CircuitApiData } from './circuit';

export interface DateTimeApiData {
    date?: string;
    time?: string;
}

export interface RaceApiData {
    season: string;
    round: string;
    url?: string;
    raceName: string;
    Circuit: CircuitApiData;
    date: string;
    time?: string;
    FirstPractice?: DateTimeApiData;
    SecondPractice?: DateTimeApiData;
    ThirdPractice?: DateTimeApiData;
    Qualifying?: DateTimeApiData;
    Sprint?: DateTimeApiData;
    SprintQualifying?: DateTimeApiData;
    SprintShootout?: DateTimeApiData;
}

export type RacesResponse = SuccessResponse<{
    RaceTable: {
        Races: RaceApiData[];
    };
}>;
