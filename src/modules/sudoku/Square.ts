import type { Cell } from './Cell';
import { CellCollection } from './CellCollection';

export class Square extends CellCollection {
    public get(item: number | [number, number]): Cell {
        if (typeof item === 'number') {
            return this[item];
        }

        return this[item[0] + item[1] * 3];
    }
}
