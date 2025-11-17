import type { Cell } from './Cell';
import type { Value } from './types';

export class CellCollection extends Array<Cell> {
    public get sum(): number {
        return this.reduce((cumulative, cell) => cumulative + (cell.value ?? 0), 0);
    }

    public isValid(): boolean {
        // TODO: Fix
        // const values = this
        //     .filter((cell) => cell.value !== null)
        //     .map((cell) => cell.value);
        //
        // if (values.length !== [...new Set(values)].length) {
        //     return false;
        // }

        return true;
    }

    public isFilled(): boolean {
        return !this.has(null);
    }

    public has(value: Value): boolean {
        for (const cell of this) {
            if (cell.value === value) {
                return true;
            }
        }

        return false;
    }

    public emptyCells(): CellCollection {
        return new CellCollection(...this.filter((cell) => cell.value === null));
    }
}
