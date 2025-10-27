export type Status = 'active' | 'finished';

export interface Answer {
    readonly value: string;
    readonly id: string;
    readonly correct: boolean;
    revealed: boolean;
}
