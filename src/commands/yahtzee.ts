import {
    ButtonStyle,
    MessageFlags,
    codeBlock,
    heading,
    type APIActionRowComponent,
    type APIButtonComponentWithCustomId,
    type APIComponentInMessageActionRow,
    type APIContainerComponent,
    type APIStringSelectComponent,
    type ChatInputCommandInteraction,
    type CommandInteraction,
    type InteractionCallbackResponse,
    type MessageComponentInteraction,
    type StringSelectMenuInteraction,
} from 'discord.js';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import { actionRow, button, container, stringSelect, textDisplay } from '../utils/builders';
import { Table, type TableRow } from '../utils/table';
import { ComponentUI } from '../utils/ui';

type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
type ScoreCardSection = 'upper' | 'lower';

class Die {
    #value: DieValue | null;
    #isHolding: boolean;

    public constructor(value?: DieValue) {
        this.#value = value ?? null;
        this.#isHolding = false;
    }

    public get value(): DieValue | null {
        return this.#value;
    }

    public get isHolding(): boolean {
        return this.#isHolding;
    }

    public set isHolding(value: boolean) {
        if (value && !this.#value) {
            return;
        }

        this.#isHolding = value;
    }

    public roll(): void {
        if (this.#value && this.#isHolding) {
            return;
        }

        this.#value = (Math.floor(Math.random() * 6) + 1) as DieValue;
        this.#isHolding = false;
    }

    public reset(): void {
        this.#value = null;
        this.#isHolding = false;
    }
}

class Dice extends Array<Die> {
    public roll(): void {
        for (const die of this) {
            die.roll();
        }
    }

    public reset(): void {
        for (const die of this) {
            die.reset();
        }
    }

    public getValues(): (DieValue | null)[] {
        return this.map((die) => die.value);
    }

    public sum(): number {
        return this.reduce((total, die) => total + (die.value ?? 0), 0);
    }

    public includesAll(values: DieValue[]): boolean {
        return values.every((value) => this.getValues().includes(value));
    }

    public count(value: DieValue): number {
        return this.filter((die) => die.value && die.value === value).length;
    }

    public isRolled(): boolean {
        return this.every((die) => die.value !== null);
    }
}

abstract class ScoreCategory {
    private scratched: boolean;
    private scoredPoints: number | null;
    public abstract readonly name: string;
    public abstract readonly id: string;
    public abstract readonly section: ScoreCardSection;

    public constructor() {
        this.scratched = false;
        this.scoredPoints = null;
    }

    public scratch(): void {
        if (!this.isOpen()) {
            return;
        }

        this.scratched = true;
    }

    public score(dice: Dice): void {
        if (!this.isOpen()) {
            return;
        }

        this.scoredPoints = this.points(dice);
    }

    public check(dice: Dice): boolean {
        return this.isOpen() && dice.isRolled() && this.validate(dice);
    }

    public isOpen(): boolean {
        return !this.isScratched() && !this.isScored();
    }

    public isScratched(): boolean {
        return this.scratched;
    }

    public isScored(): boolean {
        return this.scoredPoints !== null;
    }

    public getScoredPoints(): number | null {
        return this.scoredPoints;
    }

    public abstract points(dice: Dice): number;
    protected abstract validate(dice: Dice): boolean;
}

class UpperSectionScoreCategory extends ScoreCategory {
    public override readonly section = 'upper';
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

class ThreeOfAKind extends ScoreCategory {
    public override readonly name = 'Three of a Kind';
    public override readonly id = 'threeOfAKind';
    public override readonly section = 'lower';

    public override points(dice: Dice): number {
        return dice.sum();
    }

    protected override validate(dice: Dice): boolean {
        // return dice.some((die) => dice.count(die.getValue()) >= 3);
        for (const die of dice) {
            if (die.value && dice.count(die.value) >= 3) {
                return true;
            }
        }

        return false;
    }
}

class FourOfAKind extends ScoreCategory {
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

class FullHouse extends ScoreCategory {
    public override readonly name = 'Full House';
    public override readonly id = 'fullHouse';
    public override readonly section = 'lower';

    public override points(): number {
        return 25;
    }

    protected override validate(dice: Dice): boolean {
        // TODO: Refactor count stuff into dice class
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

class SmallStraight extends ScoreCategory {
    public override readonly name = 'Small Straight';
    public override readonly id = 'smallStraight';
    public override readonly section = 'lower';

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

class LargeStraight extends ScoreCategory {
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

class Yahtzee extends ScoreCategory {
    public override readonly name = 'Yahtzee';
    public override readonly id = 'yahtzee';
    public override readonly section = 'lower';

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

class Chance extends ScoreCategory {
    public override readonly name = 'Chance';
    public override readonly id = 'chance';
    public override readonly section = 'lower';

    public override points(dice: Dice): number {
        return dice.sum();
    }

    protected override validate(): boolean {
        return true;
    }
}

type ScoreCardOptions = Readonly<{
    bonus: Readonly<{
        threshold: number;
        reward: number;
    }>;
}>;

class ScoreCard {
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
            .filter((category) => category.section === 'upper')
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
            .filter((category) => category.section === 'lower')
            .reduce((total, category) => total + (category.getScoredPoints() ?? 0), 0);
    }

    public getGrandTotal(): number {
        return this.getUpperSectionTotal() + this.getLowerSectionTotal();
    }

    public isComplete(): boolean {
        return this.scoreCategories.every((category) => !category.isOpen());
    }
}

type GameOptions = Readonly<{
    maxRollCount: number;
}>;

class Game extends ComponentUI {
    private rollCount: number;
    private isCancelled: boolean;

    // eslint-disable-next-line @typescript-eslint/max-params
    public constructor(
        interaction: ChatInputCommandInteraction,
        private readonly scoreCard: ScoreCard,
        private readonly dice: Dice,
        private readonly options: GameOptions = {
            maxRollCount: 3,
        },
    ) {
        super(interaction, {
            time: 60_000,
        });
        this.rollCount = 0;
        this.isCancelled = false;
    }

    protected override async sendInitialMessage(
        interaction: CommandInteraction,
    ): Promise<InteractionCallbackResponse> {
        return await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [this.buildContainer()],
            withResponse: true,
        });
    }

    protected override async after(interaction: MessageComponentInteraction): Promise<void> {
        this.collector.resetTimer();

        if (this.scoreCard.isComplete()) {
            this.collector.stop();
        }

        await interaction.update({ components: [this.buildContainer()] });
    }

    protected override async onEnd(): Promise<void> {
        await this.cancel();
    }

    private canRoll(): boolean {
        return (
            this.rollCount < this.options.maxRollCount && this.dice.some((die) => !die.isHolding)
        );
    }

    private async cancel(updateMessage = true): Promise<void> {
        if (this.isCancelled) {
            return;
        }

        this.isCancelled = true;

        if (updateMessage) {
            await this.interaction.editReply({ components: [this.buildContainer()] });
        }
    }

    private rollButton(): APIButtonComponentWithCustomId {
        return this.listen(
            button({
                style: ButtonStyle.Success,
                label: `Roll ${this.rollCount}/${this.options.maxRollCount}`,
                custom_id: 'roll',
                disabled: !this.canRoll(),
            }),
            async () => {
                if (!this.canRoll()) {
                    return;
                }

                this.dice.roll();
                this.rollCount++;
            },
        );
    }

    private toggleDiceButton(): APIButtonComponentWithCustomId {
        return this.listen(
            button({
                style: ButtonStyle.Primary,
                label: 'Toggle all dice',
                custom_id: 'toggle',
                disabled: !this.dice.isRolled(),
            }),
            async () => {
                for (const die of this.dice) {
                    die.isHolding = !die.isHolding;
                }
            },
        );
    }

    private stopButton(): APIButtonComponentWithCustomId {
        return this.listen(
            button({
                style: ButtonStyle.Danger,
                label: 'Stop game',
                custom_id: 'cancel',
                disabled: this.isCancelled, // Redundant
            }),
            async () => {
                await this.cancel(false);
                this.collector.stop();
            },
        );
    }

    private dieButton(die: Die, index: number): APIButtonComponentWithCustomId {
        return this.listen(
            button({
                style: die.isHolding ? ButtonStyle.Primary : ButtonStyle.Secondary,
                label: die.value ? die.value.toString() : '?',
                custom_id: `dice${index}`,
                disabled: !die.value,
            }),
            async () => {
                die.isHolding = !die.isHolding;
            },
        );
    }

    private actionSelectMenu(actions: ScoreCategory[]): APIStringSelectComponent {
        if (!this.dice.isRolled()) {
            return stringSelect({
                placeholder: 'Roll dice to see actions',
                custom_id: 'action',
                options: [{ label: 'null', value: 'null' }],
                disabled: true,
            });
        }

        if (!actions.length) {
            return stringSelect({
                placeholder: 'No actions available',
                custom_id: 'action',
                options: [{ label: 'null', value: 'null' }],
                disabled: true,
            });
        }

        return this.listen(
            stringSelect({
                placeholder: 'Action',
                custom_id: 'action',
                options: actions.map((category) => ({
                    label: `${category.name} - ${category.points(this.dice)}`,
                    value: category.id,
                })),
            }),
            async (interaction) => {
                this.handleSelectMenu(interaction);
            },
        );
    }

    private scratchSelectMenu(scratchOptions: ScoreCategory[]): APIStringSelectComponent {
        if (!this.dice.isRolled()) {
            return stringSelect({
                placeholder: 'Roll dice to see scratches',
                custom_id: 'scratch',
                options: [{ label: 'null', value: 'null' }],
                disabled: true,
            });
        }

        if (!scratchOptions.length) {
            return stringSelect({
                placeholder: 'No scratches available',
                custom_id: 'scratch',
                options: [{ label: 'null', value: 'null' }],
                disabled: true,
            });
        }

        return this.listen(
            stringSelect({
                placeholder: 'Scratch',
                custom_id: 'scratch',
                options: scratchOptions.map((category) => ({
                    label: category.name,
                    value: category.id,
                })),
            }),
            async (interaction) => {
                this.handleSelectMenu(interaction);
            },
        );
    }

    private handleSelectMenu({
        customId,
        values: [categoryId],
    }: StringSelectMenuInteraction): void {
        const category = this.scoreCard.scoreCategories.find((c) => c.id === categoryId);

        if (!category) {
            return;
        }

        if (customId === 'scratch') {
            category.scratch();
        } else if (customId === 'action') {
            category.score(this.dice);
        }

        this.dice.reset();
        this.rollCount = 0;
    }

    private buildActionRows(): APIActionRowComponent<APIComponentInMessageActionRow>[] {
        if (this.scoreCard.isComplete() || this.isCancelled) {
            return [];
        }

        return [
            actionRow({
                components: [
                    this.rollButton(),
                    this.toggleDiceButton(),
                    this.stopButton(),
                ],
            }),
            actionRow({
                components: this.dice.map((die, index) => this.dieButton(die, index)),
            }),
            actionRow({
                components: [
                    this.actionSelectMenu(this.scoreCard.getActions(this.dice)),
                ],
            }),
            actionRow({
                components: [
                    this.scratchSelectMenu(this.scoreCard.getScratchOptions(this.dice)),
                ],
            }),
        ];
    }

    private buildCategoryTableRows(section: 'upper' | 'lower'): TableRow[] {
        return this.scoreCard.scoreCategories
            .filter((category) => category.section === section)
            .map((category) =>
                Table.row(
                    [
                        Table.cell(`${category.check(this.dice) ? '>' : ' '} ${category.name}`),
                        Table.cell(
                            category.isOpen()
                                ? ' '
                                : category.isScratched()
                                ? 'X'
                                : String(category.getScoredPoints() ?? ''),
                            { align: 'right' },
                        ),
                    ],
                    { after: category.check(this.dice) ? `[${category.points(this.dice)}]` : '' },
                )
            );
    }

    private buildTable(): TableRow[] {
        return [
            ...this.buildCategoryTableRows('upper'),
            Table.divider(),
            Table.row(
                [
                    Table.cell('Subtotal'),
                    Table.cell(this.scoreCard.getUpperSectionSubtotal(), {
                        align: 'right',
                    }),
                ],
            ),
            Table.row([
                Table.cell(
                    `Bonus (+${this.scoreCard.options.bonus.reward} if >= ${this.scoreCard.options.bonus.threshold})`,
                ),
                Table.cell(this.scoreCard.getUpperSectionBonus(), {
                    align: 'right',
                }),
            ]),
            Table.row([
                Table.cell('Total'),
                Table.cell(this.scoreCard.getUpperSectionTotal(), {
                    align: 'right',
                }),
            ]),
            Table.split(),
            ...this.buildCategoryTableRows('lower'),
            Table.divider(),
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

    private buildContainer(): APIContainerComponent {
        return container({
            components: [
                textDisplay({ content: heading('Yahtzee!') }),
                textDisplay({ content: codeBlock(new Table(this.buildTable()).render()) }),
                ...this.buildActionRows(),
            ],
        });
    }
}

export class YahtzeeCommand extends SlashCommand {
    public constructor() {
        super({
            name: 'yahtzee',
            description: 'Yahtzee!',
        });
    }

    public override async execute({ interaction }: ChatInputContext): Promise<void> {
        const game = new Game(
            interaction,
            new ScoreCard(),
            new Dice(new Die(), new Die(), new Die(), new Die(), new Die()),
        );

        await game.start();
    }
}
