import { createCanvas, type CanvasRenderingContext2D } from 'canvas';
import type { Chess } from 'chess.js';
import type { ChessBoard, ChessBoardTheme, ChessPieceFactory } from './types';

export class DefaultChessBoard implements ChessBoard {
    private readonly letterMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
    private readonly size: number;
    private readonly theme: ChessBoardTheme;
    private readonly chessPieceFactory: ChessPieceFactory;

    public constructor(options: {
        size: number;
        theme: ChessBoardTheme;
        chessPieceFactory: ChessPieceFactory;
    }) {
        this.size = options.size;
        this.theme = options.theme;
        this.chessPieceFactory = options.chessPieceFactory;
    }

    private get cellSize(): number {
        return this.size / 8;
    }

    private get borderWidth(): number {
        return this.cellSize / 2;
    }

    public async render(chess: Chess): Promise<Buffer> {
        const canvas = createCanvas(
            this.size + this.borderWidth * 2,
            this.size + this.borderWidth * 2,
        );

        const ctx = canvas.getContext('2d');

        this.drawSquare({
            ctx,
            color: this.theme.borderColor(),
            rectangle: [0, 0, canvas.width, canvas.height],
        });

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = `${this.borderWidth / 1.5}px Arial`;

        const lastMove = chess.history({ verbose: true }).at(-1);

        for (const [rowIndex, row] of chess.board().entries()) {
            ctx.fillStyle = 'white';

            ctx.fillText(
                (8 - rowIndex).toString(),
                this.borderWidth / 2,
                this.cellSize * rowIndex + this.borderWidth + this.cellSize / 2,
            );

            ctx.fillText(
                (8 - rowIndex).toString(),
                canvas.height - this.borderWidth / 2,
                this.cellSize * rowIndex + this.borderWidth + this.cellSize / 2,
            );

            for (const [columnIndex, cell] of row.entries()) {
                ctx.fillStyle = 'white';

                if (rowIndex === 0) {
                    ctx.fillText(
                        this.letterMap[columnIndex],
                        this.cellSize * columnIndex + this.borderWidth + this.cellSize / 2,
                        this.borderWidth / 2,
                    );

                    ctx.fillText(
                        this.letterMap[columnIndex],
                        this.cellSize * columnIndex + this.borderWidth + this.cellSize / 2,
                        canvas.width - this.borderWidth / 2,
                    );
                }

                const position = { x: columnIndex, y: rowIndex };

                this.fillCell({ ctx, color: this.theme.squareColor(position), position });

                const square = `${this.letterMap[columnIndex]}${8 - rowIndex}`;

                if (lastMove?.from === square) {
                    this.fillCell({ ctx, color: this.theme.lastMoveFrom(), position });
                }

                if (lastMove?.to === square) {
                    this.fillCell({ ctx, color: this.theme.lastMoveTo(), position });
                }

                if (cell) {
                    ctx.drawImage(
                        await this.chessPieceFactory.getPieceImage(cell),
                        ...this.getCellRectangleForPosition(position),
                    );
                }
            }
        }

        return canvas.toBuffer('image/png');
    }

    private drawSquare({ ctx, color, rectangle }: {
        ctx: CanvasRenderingContext2D;
        color: CanvasRenderingContext2D['fillStyle'];
        rectangle: Readonly<Parameters<CanvasRenderingContext2D['rect']>>;
    }): void {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(...rectangle);
        ctx.fill();
    }

    private fillCell({ ctx, color, position }: {
        ctx: CanvasRenderingContext2D;
        color: CanvasRenderingContext2D['fillStyle'];
        position: { x: number; y: number };
    }): void {
        this.drawSquare({
            ctx,
            color,
            rectangle: this.getCellRectangleForPosition(position),
        });
    }

    private getCellRectangleForPosition(
        position: { x: number; y: number },
    ): Parameters<CanvasRenderingContext2D['rect']> {
        return [
            this.cellSize * position.x + this.borderWidth,
            this.cellSize * position.y + this.borderWidth,
            this.cellSize,
            this.cellSize,
        ];
    }
}
