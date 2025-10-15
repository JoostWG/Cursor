import { Table, type TableRow } from '../../utils/table';
import type { Dice } from './dice';
import type { ScoreCard } from './score-card';
import type { ScoreCategory } from './score-categories';
import type { ScoreCardSection } from './types';

export class ScoreCardDisplay {
    public constructor(private readonly scoreCard: ScoreCard, private readonly dice: Dice) {}

    public build(): Table {
        return new Table(this.buildTable());
    }

    public render(): string {
        return this.build().render();
    }

    private getCategoryDisplayLabel(category: ScoreCategory): string {
        return category.check(this.dice)
            ? `> ${category.name}`
            : `  ${category.name}`;
    }

    private getCategoryDisplayValue(category: ScoreCategory): string {
        if (category.isOpen()) {
            return '';
        }

        if (category.isScratched()) {
            return 'X';
        }

        return String(category.getScoredPoints() ?? '');
    }

    private buildCategoryRow(category: ScoreCategory): TableRow {
        return Table.row(
            [
                Table.cell(this.getCategoryDisplayLabel(category)),
                Table.cell(this.getCategoryDisplayValue(category), { align: 'right' }),
            ],
            {
                after: category.check(this.dice)
                    ? `[${category.points(this.dice)}]`
                    : '',
            },
        );
    }

    private buildCategoryTableRows(section: ScoreCardSection): TableRow[] {
        return this.scoreCard.scoreCategories
            .filter((category) => category.section === section)
            .map((category) => this.buildCategoryRow(category));
    }

    private buildUpperSectionTotals(): TableRow[] {
        return [
            Table.row(
                [
                    Table.cell('Subtotal'),
                    Table.cell(this.scoreCard.getUpperSectionSubtotal(), { align: 'right' }),
                ],
            ),
            Table.row([
                Table.cell(
                    `Bonus (+${this.scoreCard.options.bonus.reward} if >= ${this.scoreCard.options.bonus.threshold})`,
                ),
                Table.cell(this.scoreCard.getUpperSectionBonus(), { align: 'right' }),
            ]),
            Table.row([
                Table.cell('Total'),
                Table.cell(this.scoreCard.getUpperSectionTotal(), { align: 'right' }),
            ]),
        ];
    }

    private buildLowerSectionTotals(): TableRow[] {
        return [
            Table.row([
                Table.cell('Upper Section Total'),
                Table.cell(this.scoreCard.getUpperSectionTotal(), { align: 'right' }),
            ]),
            Table.row([
                Table.cell('Lower Section Total'),
                Table.cell(this.scoreCard.getLowerSectionTotal(), { align: 'right' }),
            ]),
            Table.row([
                Table.cell('Grand Total'),
                Table.cell(this.scoreCard.getGrandTotal(), { align: 'right' }),
            ]),
        ];
    }

    private buildTable(): TableRow[] {
        return [
            ...this.buildCategoryTableRows('upper'),
            Table.divider(),
            ...this.buildUpperSectionTotals(),
            Table.split(),
            ...this.buildCategoryTableRows('lower'),
            Table.divider(),
            ...this.buildLowerSectionTotals(),
        ];
    }
}
