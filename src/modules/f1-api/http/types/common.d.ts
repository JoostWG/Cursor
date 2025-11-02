export interface FinishingTimeApiData {
    millis: string;
    time: string;
}

export interface FastestLapTimeApiData {
    time: string;
}

export interface AverageSpeedApiData {
    units: string;
    speed: string;
}

export interface FastestLapApiData {
    rank: string;
    lap: string;
    Time: FastestLapTimeApiData;
    AverageSpeed: AverageSpeedApiData;
}
