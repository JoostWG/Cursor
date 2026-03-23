import type { ChessBoardColor, ChessBoardTheme } from './types';

export class CheckerboardTheme implements ChessBoardTheme {
    public constructor(
        protected readonly colors: {
            light: ChessBoardColor;
            dark: ChessBoardColor;
            border: ChessBoardColor;
            lastMove: {
                from: ChessBoardColor;
                to: ChessBoardColor;
            };
        },
    ) {}

    public squareColor(position: { x: number; y: number }): ChessBoardColor {
        return (position.x + position.y) % 2 ? this.colors.dark : this.colors.light;
    }

    public borderColor(): ChessBoardColor {
        return this.colors.border;
    }

    public lastMoveFrom(): ChessBoardColor {
        return this.colors.lastMove.from;
    }

    public lastMoveTo(): ChessBoardColor {
        return this.colors.lastMove.to;
    }
}
