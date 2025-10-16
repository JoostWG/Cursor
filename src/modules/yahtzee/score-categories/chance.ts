import type { Dice } from '../dice';
import { ScoreCardSection } from '../score-card-section';
import { ScoreCategory } from './score-category';

export class Chance extends ScoreCategory {
    public override readonly name = 'Chance';
    public override readonly id = 'chance';
    public override readonly section = ScoreCardSection.Lower;

    public override points(dice: Dice): number {
        return dice.sum();
    }

    protected override validate(): boolean {
        return true;
    }
}
