import type { Dice } from '../Dice_temp';
import { ScoreCardSection } from '../ScoreCardSection';
import type { DieValue } from '../types';
import { ScoreCategory } from './score-category';

export class UpperSectionScoreCategory extends ScoreCategory {
    public override readonly section = ScoreCardSection.Upper;
    public override readonly id: string;

    public constructor(private readonly value: DieValue, public override readonly name: string) {
        super();
        this.id = this.name.toLowerCase();
    }

    public override points(dice: Dice): number {
        return this.value * dice.count(this.value);
    }

    protected override validate(dice: Dice): boolean {
        return dice.getValues().includes(this.value);
    }
}
