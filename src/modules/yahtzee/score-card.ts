import type { Dice } from './dice';
import { ScoreCardSection } from './score-card-section';
import {
    Chance,
    FourOfAKind,
    FullHouse,
    LargeStraight,
    SmallStraight,
    ThreeOfAKind,
    UpperSectionScoreCategory,
    Yahtzee,
    type ScoreCategory,
} from './score-categories';
import type { ScoreCardOptions } from './types';

export class ScoreCard {
    public readonly scoreCategories: readonly ScoreCategory[];

    public constructor(
        public readonly options: ScoreCardOptions = {
            bonus: { threshold: 63, reward: 35 },
        },
    ) {
        this.scoreCategories = [
            new UpperSectionScoreCategory(1, 'Ones'),
            new UpperSectionScoreCategory(2, 'Twos'),
            new UpperSectionScoreCategory(3, 'Threes'),
            new UpperSectionScoreCategory(4, 'Fours'),
            new UpperSectionScoreCategory(5, 'Fives'),
            new UpperSectionScoreCategory(6, 'Sixes'),
            new ThreeOfAKind(),
            new FourOfAKind(),
            new FullHouse(),
            new SmallStraight(),
            new LargeStraight(),
            new Yahtzee(),
            new Chance(),
        ];
    }

    public getActions(dice: Dice): ScoreCategory[] {
        if (!dice.isRolled()) {
            return [];
        }

        return this.scoreCategories.filter((category) => category.check(dice));
    }

    public getScratchOptions(dice: Dice): ScoreCategory[] {
        if (!dice.isRolled()) {
            return [];
        }

        return this.scoreCategories.filter((category) => category.isOpen());
    }

    public getUpperSectionSubtotal(): number {
        return this.scoreCategories
            .filter((category) => category.section === ScoreCardSection.Upper)
            .reduce((subtotal, category) => subtotal + (category.getScoredPoints() ?? 0), 0);
    }

    public getUpperSectionBonus(): number {
        return this.getUpperSectionSubtotal() >= this.options.bonus.threshold
            ? this.options.bonus.reward
            : 0;
    }

    public getUpperSectionTotal(): number {
        return this.getUpperSectionSubtotal() + this.getUpperSectionBonus();
    }

    public getLowerSectionTotal(): number {
        return this.scoreCategories
            .filter((category) => category.section === ScoreCardSection.Lower)
            .reduce((total, category) => total + (category.getScoredPoints() ?? 0), 0);
    }

    public getGrandTotal(): number {
        return this.getUpperSectionTotal() + this.getLowerSectionTotal();
    }

    public isComplete(): boolean {
        return this.scoreCategories.every((category) => !category.isOpen());
    }
}
