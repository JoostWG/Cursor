import type { Dice } from '../Dice';
import { ScoreCardSection } from '../ScoreCardSection';
import { ScoreCategory } from './score-category';

export class Yahtzee extends ScoreCategory {
    public override readonly name = 'Yahtzee';
    public override readonly id = 'yahtzee';
    public override readonly section = ScoreCardSection.Lower;

    public override points(): number {
        return 50;
    }

    protected override validate(dice: Dice): boolean {
        for (const die of dice) {
            if (die.value && dice.count(die.value) === 5) {
                return true;
            }
        }

        return false;
    }
}
