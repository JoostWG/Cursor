import { actionRow, button, container, stringSelect, textDisplay } from '@/lib/utils/builders';
import { ComponentUI } from '@/lib/utils/ComponentUI';
import type { Dice, Die, GameOptions, ScoreCard, ScoreCategory } from '@/modules/yahtzee';
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
import { ScoreCardDisplay } from './ScoreCardDisplay';

export class Game extends ComponentUI {
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
            this.rollCount < this.options.maxRollCount && this.dice.some((die) => !die.isLocked())
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
                    die.toggleLocked();
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
                style: die.isLocked() ? ButtonStyle.Primary : ButtonStyle.Secondary,
                label: die.value ? die.value.toString() : '?',
                custom_id: `dice${index}`,
                disabled: !die.value,
            }),
            async () => {
                die.toggleLocked();
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

    private buildContainer(): APIContainerComponent {
        return container({
            components: [
                textDisplay({ content: heading('Yahtzee!') }),
                textDisplay({
                    content: codeBlock(new ScoreCardDisplay(this.scoreCard, this.dice).render()),
                }),
                ...this.buildActionRows(),
            ],
        });
    }
}
