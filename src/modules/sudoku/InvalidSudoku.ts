import type { Sudoku } from './Sudoku';

export class InvalidSudoku extends Error {
    public constructor(public readonly sudoku: Sudoku) {
        super('Invalid sudoku');
    }
}
