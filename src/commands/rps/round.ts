import type { Choice } from './Choice';
import { emojis } from './emojis';

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

    public getResult(): number {
        if (!this.choices[0] || !this.choices[1]) {
            return -1;
        }

        const keys = Object.keys(emojis);
        return (keys.indexOf(this.choices[0]) - keys.indexOf(this.choices[1])) % 3;
    }
}
