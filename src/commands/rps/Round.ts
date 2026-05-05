import type { Choice } from './Choice';
import { emojis } from './emojis';
import { RoundResult } from './RoundResult';

export class Round {
    public choices: [Choice | null, Choice | null];
    public roundId?: number;

    public constructor() {
        this.choices = [null, null];
    }

    public get(index: number): Choice | null {
        return this.choices[index];
    }

    public set(index: number, choice: Choice): void {
        this.choices[index] = choice;
    }

    public isFinished(): boolean {
        return !this.choices.includes(null);
    }

    public getResult(): RoundResult {
        if (!this.choices[0] || !this.choices[1]) {
            return RoundResult.Unfinished;
        }

        const keys = Object.keys(emojis);

        const index = (keys.indexOf(this.choices[0]) - keys.indexOf(this.choices[1])) % 3;

        return [RoundResult.Tie, RoundResult.PlayerOneWins, RoundResult.PlayerTwoWins][index];
    }
}
