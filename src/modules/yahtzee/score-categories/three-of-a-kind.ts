import type { Dice } from '../Dice_temp';
import { ScoreCardSection } from '../ScoreCardSection';
import { ScoreCategory } from './score-category';

export class ThreeOfAKind extends ScoreCategory {
    public override readonly name = 'Three of a Kind';
    public override readonly id = 'threeOfAKind';
    public override readonly section = ScoreCardSection.Lower;

    public override points(dice: Dice): number {
        return dice.sum();
    }

    protected override validate(dice: Dice): boolean {
        for (const die of dice) {
            if (die.value && dice.count(die.value) >= 3) {
                return true;
            }
        }

        return false;
    }
}
