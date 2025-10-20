import type { Dice } from '../Dice';
import { ScoreCardSection } from '../ScoreCardSection';
import { ScoreCategory } from './score-category';

export class FourOfAKind extends ScoreCategory {
    public override readonly name = 'Four of a Kind';
    public override readonly id = 'fourOfAKind';
    public override readonly section = ScoreCardSection.Lower;

    public override points(dice: Dice): number {
        return dice.sum();
    }

    protected override validate(dice: Dice): boolean {
        for (const die of dice) {
            if (die.value && dice.count(die.value) >= 4) {
                return true;
            }
        }

        return false;
    }
}
