import type { Cell } from './Cell';
import type { Value } from './types';

export class CellCollection extends Array<Cell> {
    public isValid(): boolean {
        if (this.length !== 9) {
            return false;
        }

        for (const { value } of this) {
            if (value !== null && this.filter((cell) => cell.value === value).length > 1) {
                return false;
            }
        }

        return true;
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
