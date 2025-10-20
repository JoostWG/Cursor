import type { Dice } from '../Dice';
import { ScoreCardSection } from '../ScoreCardSection';
import { ScoreCategory } from './score-category';

export class FullHouse extends ScoreCategory {
    public override readonly name = 'Full House';
    public override readonly id = 'fullHouse';
    public override readonly section = ScoreCardSection.Lower;

    public override points(): number {
        return 25;
    }

    protected override validate(dice: Dice): boolean {
        const counts = new Map<number, number>();

        for (const die of dice) {
            if (die.value) {
                counts.set(die.value, (counts.get(die.value) ?? 0) + 1);
            }
        }

        const values = Array.from(counts.values()).sort();

        return values.length === 2 && values[0] === 2 && values[1] === 3;
    }
}
