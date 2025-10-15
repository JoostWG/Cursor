export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
export type ScoreCardSection = 'upper' | 'lower';

export type ScoreCardOptions = Readonly<{
    bonus: Readonly<{
        threshold: number;
        reward: number;
    }>;
}>;

export type GameOptions = Readonly<{
    maxRollCount: number;
}>;
