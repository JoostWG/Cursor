import type { Dice } from '../Dice_temp';
import type { ScoreCardSection } from '../ScoreCardSection';

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
            return;
        }

        this.scratched = true;
    }

    public score(dice: Dice): void {
        if (!this.isOpen()) {
            return;
        }

        this.scoredPoints = this.points(dice);
    }

    public check(dice: Dice): boolean {
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

    public abstract points(dice: Dice): number;
    protected abstract validate(dice: Dice): boolean;
}
