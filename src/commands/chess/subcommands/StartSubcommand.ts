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
        const game = new Game({
            chess: new Chess(),
            output: new InteractionHandler(interaction, new DefaultMessageFactory()),
            board: new DefaultChessBoard({
                size: 512,
                theme: new CheckerboardTheme({
                    light: '#ffcf9f',
                    dark: '#d28c45',
                    border: '#241302',
                }),
                chessPieceFactory: new DefaultChessPieceFactory('../../assets/chess'),
            }),
        });

        this.games.set(interaction.user.id, game);

        await game.start();
    }
}
