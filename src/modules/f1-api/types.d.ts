import type { StatusType } from './enums';

export interface AverageSpeedJson {
    units: string;
    speed: number;
}

export interface CircuitLocationJson {
    latitude: number;
    longitude: number;
    locality: string;
    country: string;
}

export interface FastestLapJson {
    rank: number;
    lap: number;
    time: FastestLapTimeJson;
    averageSpeed: AverageSpeedJson;
}

export interface FastestLapTimeJson {
    time: string;
}

export interface FinishingTimeJson {
    milliseconds: number;
    time: string;
}

export interface LapTimingJson {
    driverId: string;
    position: number;
    time: string;
}

export interface SessionDateTimeJson {
    date: string | null;
    time: string | null;
}

export interface CircuitJson {
    id: string;
    url: string;
    name: string;
    location: CircuitLocationJson;
}

export interface DriverJson {
    id: string;
    url: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    number: number | null;
    code: string | null;
}

export interface DriverStandingJson {
    position: number | null;
    positionText: string;
    points: number;
    wins: number;
    driver: DriverJson;
    teams: TeamJson[];
}

export interface LapJson {
    number: number;
    timings: LapTimingJson[];
}

export interface PitStopJson {
    driverId: string;
    lap: number | null;
    stop: number | null;
    time: string | null;
    duration: number | null;
}

export interface QualifyingResultJson {
    number: number;
    position: number | null;
    driver: DriverJson;
    team: TeamJson;
    q1: string | null;
    q2: string | null;
    q3: string | null;
}

export interface RaceJson {
    season: string;
    round: number;
    url: string | null;
    name: string;
    circuit: CircuitJson;
    date: string;
    time: string | null;
    firstPractice: SessionDateTimeJson | null;
    secondPractice: SessionDateTimeJson | null;
    thirdPractice: SessionDateTimeJson | null;
    qualifying: SessionDateTimeJson | null;
    sprint: SessionDateTimeJson | null;
    sprintQualifying: SessionDateTimeJson | null;
    sprintShootout: SessionDateTimeJson | null;
}

export interface ResultJson {
    number: number;
    position: string;
    positionText: string;
    points: number;
    driver: DriverJson;
    team: TeamJson | null;
    grid: number | null;
    laps: number | null;
    status: string | null;
    fastestLap: FastestLapJson;
    finishingTime: FinishingTimeJson | null;
}

export interface SeasonJson {
    year: string;
    url: string;
}

export interface SprintResultJson {
    number: number;
    position: string;
    positionText: string;
    points: number;
    driver: DriverJson;
    team: TeamJson | null;
    grid: number | null;
    laps: number | null;
    status: string | null;
    finishingTime: FinishingTimeJson | null;
    fastestLap: FastestLapJson | null;
}

export interface StatusJson {
    id: StatusType;
    count: number;
    name: string;
}

export interface TeamJson {
    id: string | null;
    url: string | null;
    name: string;
    nationality: string | null;
}

export interface TeamStandingJson {
    position: string | null;
    positionText: string;
    points: number;
    wins: number;
    team: TeamJson;
}
