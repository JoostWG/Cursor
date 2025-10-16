import { createCanvas, type CanvasRenderingContext2D } from 'canvas';
import type { Chess } from 'chess.js';
import type { ChessBoard, ChessBoardTheme, ChessPieceFactory } from './types';

export class DefaultChessBoard implements ChessBoard {
    private readonly letterMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

    public constructor(
        private readonly size: number,
        private readonly theme: ChessBoardTheme,
        private readonly chessPieceFactory: ChessPieceFactory,
    ) {}

    public async render(chess: Chess): Promise<Buffer> {
        const cellSize = this.size / 8;
        const borderWidth = this.size / 16;
        const canvas = createCanvas(this.size + borderWidth * 2, this.size + borderWidth * 2);
        const ctx = canvas.getContext('2d');

        this.drawSquare(ctx, this.theme.borderColor(), 0, 0, canvas.width, canvas.height);

        const lastMove = chess.history({ verbose: true }).at(-1);

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = `${borderWidth / 1.5}px Arial`;

        for (const [rowIndex, row] of chess.board().entries()) {
            ctx.fillStyle = 'white';

            ctx.fillText(
                (8 - rowIndex).toString(),
                borderWidth / 2,
                cellSize * rowIndex + borderWidth + cellSize / 2,
            );

            ctx.fillText(
                (8 - rowIndex).toString(),
                canvas.height - borderWidth / 2,
                cellSize * rowIndex + borderWidth + cellSize / 2,
            );

            for (const [columnIndex, cell] of row.entries()) {
                ctx.fillStyle = 'white';

                if (rowIndex === 0) {
                    ctx.fillText(
                        this.letterMap[columnIndex],
                        cellSize * columnIndex + borderWidth + cellSize / 2,
                        borderWidth / 2,
                    );

                    ctx.fillText(
                        this.letterMap[columnIndex],
                        cellSize * columnIndex + borderWidth + cellSize / 2,
                        canvas.width - borderWidth / 2,
                    );
                }

                const pos = [
                    cellSize * columnIndex + borderWidth,
                    cellSize * rowIndex + borderWidth,
                    cellSize,
                    cellSize,
                ] as const;

                const square = `${this.letterMap[columnIndex]}${8 - rowIndex}`;

                this.drawSquare(ctx, this.theme.squareColor(columnIndex, rowIndex), ...pos);

                if (lastMove?.from === square) {
                    this.drawSquare(ctx, '#FF000033', ...pos);
                }

                if (lastMove?.to === square) {
                    this.drawSquare(ctx, '#00FF0033', ...pos);
                }

                if (cell) {
                    ctx.drawImage(await this.chessPieceFactory.getPieceImage(cell), ...pos);
                }
            }
        }

        return canvas.toBuffer('image/png');
    }

    private drawSquare(
        ctx: CanvasRenderingContext2D,
        fillStyle: CanvasRenderingContext2D['fillStyle'],
        ...args: Parameters<CanvasRenderingContext2D['rect']>
    ): void {
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.rect(...args);
        ctx.fill();
    }
}
