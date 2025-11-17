import type { CellCollection } from './CellCollection';
import type { Square } from './Square';
import type { Sudoku } from './Sudoku';
import type { Position, Value } from './types';

export class Cell {
    public sudoku!: Sudoku;
    public square!: Square;
    public row!: CellCollection;
    public column!: CellCollection;
    #value: Value;

    public constructor(
        value: Value,
        public readonly absolutePosition: Position,
        public readonly index: number,
    ) {
        this.#value = value;
    }

    public get relativePosition(): Position {
        return {
            x: this.absolutePosition.x % 3,
            y: this.absolutePosition.y % 3,
        };
    }

    public get parentPosition(): Position {
        return {
            x: Math.floor(this.absolutePosition.x / 3),
            y: Math.floor(this.absolutePosition.y / 3),
        };
    }

    public get value(): Value {
        return this.#value;
    }

    public set value(value: Value) {
        // if (value) {
        //     console.log(this.sudoku.toDataString().replaceAll('x', ' '));
        // }

        if (value && (value < 1 || value > 9)) {
            throw new Error(`Something has gone terribly wrong. ${value}`);
        }

        this.#value = value;
    }

    public options(): number[] {
        if (this.value !== null) {
            return [];
        }

        const options = [];

        for (let x = 1; x < 10; x++) {
            if (this.square.has(x) || this.row.has(x) || this.column.has(x)) {
                continue;
            }

            options.push(x);
        }

        return options;
    }

    /**
     * Solve the cell.
     * Returns the value if the solved.
     * Returns None if the cell cannot be solved because of more than one possibility
     * Returns False if the cell cannot be solved because of no possibilities (invalid sudoku)
     */
    public solve(): number | boolean | null {
        if (this.value !== null) {
            return null;
        }

        const options = this.options().filter((x) => x > 0);

        if (!options.length) {
            return null;
        }

        if (options.length === 1) {
            [this.value] = options;

            return this.value;
        }

        const others = [
            this.square.map((cell) => cell.options()).flat(),
            this.row.map((cell) => cell.options()).flat(),
            this.column.map((cell) => cell.options()).flat(),
        ];

        for (const x of options) {
            for (const other of others) {
                if (other.filter((o) => o === x).length === 1) {
                    this.value = x;
                    return this.value;
                }
            }
        }

        return null;
    }

    public toString(): string {
        return this.value !== null ? this.value.toString() : '-';
    }
}
