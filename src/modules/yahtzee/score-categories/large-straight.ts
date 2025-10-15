import type { Dice } from '../dice';
import { ScoreCategory } from './score-category';

export class LargeStraight extends ScoreCategory {
    public override readonly name = 'Large Straight';
    public override readonly id = 'largeStraight';
    public override readonly section = 'lower';

    public override points(): number {
        return 40;
    }

    protected override validate(dice: Dice): boolean {
        return dice.includesAll([1, 2, 3, 4, 5]) || dice.includesAll([2, 3, 4, 5, 6]);
    }
}
