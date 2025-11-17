import type { Cell } from './Cell';
import type { Value } from './types';

export class CellCollection extends Array<Cell> {
    public get sum(): number {
        return this.reduce((cumulative, cell) => cumulative + (cell.value ?? 0), 0);
    }

    public isValid(): boolean {
        if (this.length !== 9) {
            return false;
        }

        for (const { value } of this) {
            if (value !== null && this.count(value) > 1) {
                return false;
            }
        }

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

    public count(value: Value): number {
        return this.filter((cell) => cell.value === value).length;
    }
}
