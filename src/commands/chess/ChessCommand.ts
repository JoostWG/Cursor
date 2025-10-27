import { SlashCommand, type ChatInputContext } from '@/lib/core';
import { stringOption, subcommand } from '@/lib/utils/builders';
import { Chess } from 'chess.js';
import {
    MessageFlags,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type Snowflake,
} from 'discord.js';
import { CheckerboardTheme } from './CheckerboardTheme';
import { DefaultChessBoard } from './DefaultChessBoard';
import { DefaultChessPieceFactory } from './DefaultChessPieceFactory';
import { DefaultMessageFactory } from './DefaultMessageFactory';
import { Game } from './Game';
import { InteractionHandler } from './InteractionHandler';

export class ChessCommand extends SlashCommand {
    private readonly games: Map<Snowflake, Game>;

    public constructor() {
        super({
            name: 'chess',
            description: 'Play some chess!',
            options: [
                subcommand({
                    name: 'start',
                    description: 'Start a game',
                }),
                subcommand({
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
                }),
            ],
        });

        this.games = new Map();
        this.devOnly = true;
    }

    public override async autocomplete(
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

    public override async handle({ interaction }: ChatInputContext): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case 'start':
                await this.handleStart(interaction);
                break;

            case 'move':
                await this.handleMove(interaction);
                break;
        }
    }

    private async handleStart(interaction: ChatInputCommandInteraction): Promise<void> {
        const game = new Game(
            new Chess(),
            new InteractionHandler(interaction, new DefaultMessageFactory()),
            new DefaultChessBoard(
                512,
                new CheckerboardTheme({ light: '#ffcf9f', dark: '#d28c45', border: '#241302' }),
                new DefaultChessPieceFactory('../../assets/chess'),
            ),
        );

        this.games.set(interaction.user.id, game);

        await game.start();
    }

    private async handleMove(interaction: ChatInputCommandInteraction): Promise<void> {
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
