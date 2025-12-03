import _ from 'lodash';
import { Cell } from './Cell';
import { CellCollection } from './CellCollection';
import type { Value } from './types';

// TODO: Test with lodash
export class Sudoku {
    private readonly cells: CellCollection;
    private readonly rows: CellCollection[];
    private readonly columns: CellCollection[];
    private readonly squares: CellCollection[];

    public constructor(cells: Cell[]) {
        this.cells = new CellCollection(...cells);
        this.rows = _.chunk(this.cells, 9).map((chunk) => new CellCollection(...chunk));
        this.columns = _.zip(...this.rows).map((chunk) => new CellCollection(..._.compact(chunk)));

        this.squares = [];

        for (const sqr of _.chunk(this.cells, 27)) {
            for (const s of _.zip(..._.chunk(sqr, 9).map((r) => _.chunk(r, 3)))) {
                this.squares.push(new CellCollection(..._.compact(s.flat())));
            }
        }

        if (!this.isValid()) {
            throw new Error('Invalid sudoku');
        }

        for (const cell of cells) {
            cell.square = this.get([cell.parentPosition.x, cell.parentPosition.y]);
            cell.row = this.rows[cell.absolutePosition.y];
            cell.column = this.columns[cell.absolutePosition.x];
        }
    }

    public static fromString(data: string): Sudoku {
        const cleanData = data.replaceAll('_', 'x').replaceAll('0', 'x');

        return new this(
            cleanData
                .split('')
                .map((x, i) =>
                    new Cell(
                        x !== 'x' ? Number(x) : null,
                        { x: i % 9, y: Math.floor(i / 9) },
                    )
                ),
        );
    }

    public emptyCells(): Cell[] {
        return this.cells.emptyCells();
    }

    public isSolved(): boolean {
        return !this.cells.has(null) && this.isValid();
    }

    public isValid(): boolean {
        for (const collections of [this.squares, this.rows, this.columns]) {
            for (const collection of collections) {
                if (!collection.isValid()) {
                    return false;
                }
            }
        }

        return true;
    }

    public solve(): boolean {
        while (!this.isSolved()) {
            let changed = false;

            const cells = this.emptyCells().toSorted((a, b) =>
                a.options().length - b.options().length
            );

            for (const cell of cells) {
                const solved = cell.solve();

                if (solved === false) {
                    return false;
                }

                if (!changed && solved !== null) {
                    changed = true;
                }
            }

            if (!changed) {
                break;
            }
        }

        if (this.isSolved()) {
            return true;
        }

        const originalValues = this.cells.map((cell) => cell.value);

        const [cell] = this.emptyCells().toSorted((a, b) =>
            a.options().length - b.options().length
        );

        const options = cell.options();

        for (const option of options) {
            if (option < 0) {
                continue;
            }

            cell.value = option;

            if (this.solve()) {
                return true;
            }

            this.setCellValuesTo(originalValues);
        }

        return false;
    }

    public toDataString(): string {
        return this.cells.map((cell) => cell.toString().replaceAll('-', 'x')).join('');
    }

    public get(item: number | [number, number]): CellCollection {
        if (typeof item === 'number') {
            return this.squares[item];
        }

        return this.squares[item[0] + item[1] * 3];
    }

    public toString(): string {
        const lines = [];

        for (const sc of _.chunk(this.rows, 3)) {
            for (const chunk1 of sc) {
                lines.push(
                    _.chunk(chunk1, 3)
                        .map((a) => a.map((cell) => cell.toString()).join('')).join(' '),
                );
            }

            lines.push('');
        }

        return lines.join('\n').trim();
    }

    private setCellValuesTo(data: Value[]): void {
        for (const [index, cell] of this.cells.entries()) {
            cell.value = data[index];
        }
    }
}
