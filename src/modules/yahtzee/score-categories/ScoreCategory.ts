import type { Dice } from '../Dice';
import type { ScoreCardSection } from '../ScoreCardSection';
import { YahtzeeError } from '../YahtzeeError';

export abstract class ScoreCategory {
    private scratched: boolean;
    private scoredPoints: number | null;
    public abstract readonly name: string;
    public abstract readonly id: string;
    public abstract readonly section: ScoreCardSection;

    public constructor() {
        this.scratched = false;
        this.scoredPoints = null;
    }

    public scratch(): void {
        if (!this.isOpen()) {
            throw new YahtzeeError("Cannot scratch a category that isn't open");
        }

        this.scratched = true;
    }

    public score(dice: Dice): void {
        if (!this.isValid(dice)) {
            throw new YahtzeeError('Cannot score a that is not valid or not open');
        }

        this.scoredPoints = this.getPoints(dice);
    }

    public isValid(dice: Dice): boolean {
        return this.isOpen() && dice.isRolled() && this.validate(dice);
    }

    public isOpen(): boolean {
        return !this.isScratched() && !this.isScored();
    }

    public isScratched(): boolean {
        return this.scratched;
    }

    public isScored(): boolean {
        return this.scoredPoints !== null;
    }

    public getScoredPoints(): number | null {
        return this.scoredPoints;
    }

    public abstract getPoints(dice: Dice): number;
    protected abstract validate(dice: Dice): boolean;
}
