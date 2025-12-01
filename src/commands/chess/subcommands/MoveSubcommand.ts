import {
    MessageFlags,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
} from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { stringOption } from '../../../lib/utils/builders';
import { ChessSubcommand } from './ChessSubcommand';

export class MoveSubcommand extends ChessSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'move',
            description: 'Play a move',
            options: [
                stringOption({
                    name: 'move',
                    description: 'Move notation',
                    required: true,
                    autocomplete: true,
                }),
            ],
        };
    }

    protected override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const game = this.games.get(interaction.user.id);

        if (!game) {
            return [];
        }

        const q = interaction.options.getFocused();

        return game
            .getValidMoves()
            .filter((move) => move.includes(q))
            .map((move) => ({ name: move, value: move }));
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const game = this.games.get(interaction.user.id);
        const move = interaction.options.getString('move', true);

        if (!game) {
            await interaction.reply({
                flags: MessageFlags.Ephemeral,
                content: 'No game found',
            });

            return;
        }

        if (game.getValidMoves().includes(move)) {
            await Promise.all([
                game.move(move),
                interaction.reply({
                    flags: MessageFlags.Ephemeral,
                    content: 'Moving...',
                }),
            ]);
        } else {
            await interaction.reply({
                flags: MessageFlags.Ephemeral,
                content: 'Invalid move',
            });
        }

        await interaction.deleteReply();
    }
}
