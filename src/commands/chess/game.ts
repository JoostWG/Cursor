import type { Chess } from 'chess.js';
import { InvalidMove } from './InvalidMove';
import type { ChessBoard, OutputHandler } from './types';

export class Game {
    public constructor(
        private readonly chess: Chess,
        private readonly output: OutputHandler,
        private readonly board: ChessBoard,
    ) {}

    public async start(): Promise<void> {
        await this.output.initiate(this.chess, await this.board.render(this.chess));
    }

    public async move(move: string): Promise<void> {
        if (!this.chess.moves().includes(move)) {
            throw new InvalidMove(move);
        }

        this.chess.move(move);

        await this.output.update(this.chess, await this.board.render(this.chess));
    }

    public getValidMoves(): string[] {
        return this.chess.moves();
    }
}
