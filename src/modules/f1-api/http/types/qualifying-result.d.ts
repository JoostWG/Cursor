import type { ConstructorApiData, DriverApiData, RaceApiData, SuccessResponse } from '.';

export interface QualifyingResultApiData {
    number: string;
    position?: string;
    Driver: DriverApiData;
    Constructor: ConstructorApiData;
    Q1?: string;
    Q2?: string;
    Q3?: string;
}

export type QualifyingResultsResponse = SuccessResponse<{
    RaceTable: {
        Races: (RaceApiData & { QualifyingResults: QualifyingResultApiData[] })[];
    };
}>;
