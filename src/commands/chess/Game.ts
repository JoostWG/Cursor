import type { Chess } from 'chess.js';
import { InvalidMove } from './InvalidMove';
import type { ChessBoard, OutputHandler } from './types';

export class Game {
    private readonly chess: Chess;
    private readonly output: OutputHandler;
    private readonly board: ChessBoard;

    public constructor(options: { chess: Chess; output: OutputHandler; board: ChessBoard }) {
        this.chess = options.chess;
        this.output = options.output;
        this.board = options.board;
    }

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
