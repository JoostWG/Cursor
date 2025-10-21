import type { Dice } from '../Dice';
import { ScoreCardSection } from '../ScoreCardSection';
import { ScoreCategory } from './ScoreCategory';

export class LargeStraight extends ScoreCategory {
    public override readonly name = 'Large Straight';
    public override readonly id = 'largeStraight';
    public override readonly section = ScoreCardSection.Lower;

    public override points(): number {
        return 40;
    }

    protected override validate(dice: Dice): boolean {
        return dice.includesAll([1, 2, 3, 4, 5]) || dice.includesAll([2, 3, 4, 5, 6]);
    }
}
