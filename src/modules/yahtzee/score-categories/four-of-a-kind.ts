import type { Dice } from '../dice';
import { ScoreCategory } from './score-category';

export class FourOfAKind extends ScoreCategory {
    public override readonly name = 'Four of a Kind';
    public override readonly id = 'fourOfAKind';
    public override readonly section = 'lower';

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
