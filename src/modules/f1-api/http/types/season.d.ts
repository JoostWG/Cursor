import type { SuccessResponse } from '.';

export interface SeasonApiData {
    season: string;
    url: string;
}

export type SeasonsResponse = SuccessResponse<{
    SeasonTable: {
        Seasons: SeasonApiData[];
    };
}>;
