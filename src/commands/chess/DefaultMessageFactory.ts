import type { Chess } from 'chess.js';
import type { MessageFactory } from './types';

export class DefaultMessageFactory implements MessageFactory {
    public getMessage(chess: Chess): string {
        const title = `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;

        if (chess.isCheckmate()) {
            return `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`;
        } else if (chess.isDraw()) {
            return 'Draw! TODO: Display why';
        } else if (chess.isCheck()) {
            return `Check! ${title}`;
        }

        return title;
    }
}
