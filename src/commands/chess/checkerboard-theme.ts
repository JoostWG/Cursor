import type { ChessBoardColor, ChessBoardTheme } from './types';

export class CheckerboardTheme implements ChessBoardTheme {
    public constructor(
        private readonly colors: {
            light: ChessBoardColor;
            dark: ChessBoardColor;
            border: ChessBoardColor;
        },
    ) {}

    public squareColor(x: number, y: number): ChessBoardColor {
        return (x + y) % 2 ? this.colors.dark : this.colors.light;
    }

    public borderColor(): ChessBoardColor {
        return this.colors.border;
    }
}
