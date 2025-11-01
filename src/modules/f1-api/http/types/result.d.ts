import type { ConstructorApiData } from './constructor';
import type { DriverApiData } from './driver';

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
    FastestLap: FastestLapTimeApiData;
}
