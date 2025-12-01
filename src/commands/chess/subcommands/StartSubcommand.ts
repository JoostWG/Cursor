import { Chess } from 'chess.js';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { CheckerboardTheme } from '../CheckerboardTheme';
import { DefaultChessBoard } from '../DefaultChessBoard';
import { DefaultChessPieceFactory } from '../DefaultChessPieceFactory';
import { DefaultMessageFactory } from '../DefaultMessageFactory';
import { Game } from '../Game';
import { InteractionHandler } from '../InteractionHandler';
import { ChessSubcommand } from './ChessSubcommand';

export class StartSubcommand extends ChessSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'start',
            description: 'Start a game',
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
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
}
