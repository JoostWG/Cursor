import type { Dice } from '../Dice_temp';
import { ScoreCardSection } from '../ScoreCardSection';
import { ScoreCategory } from './score-category';

export class SmallStraight extends ScoreCategory {
    public override readonly name = 'Small Straight';
    public override readonly id = 'smallStraight';
    public override readonly section = ScoreCardSection.Lower;

    public override points(): number {
        return 30;
    }

    protected override validate(dice: Dice): boolean {
        return (
            dice.includesAll([1, 2, 3, 4])
            || dice.includesAll([2, 3, 4, 5])
            || dice.includesAll([3, 4, 5, 6])
        );
    }
}
