import { Die } from './Die_temp';
import type { DieValue } from './types';

export class Dice extends Array<Die> {
    public roll(): void {
        for (const die of this) {
            die.roll();
        }
    }

    public reset(): void {
        for (const die of this) {
            die.reset();
        }
    }

    public getValues(): (DieValue | null)[] {
        return this.map((die) => die.value);
    }

    public sum(): number {
        return this.reduce((total, die) => total + (die.value ?? 0), 0);
    }

    public includesAll(values: DieValue[]): boolean {
        return values.every((value) => this.getValues().includes(value));
    }

    public count(value: DieValue): number {
        return this.filter((die) => die.value && die.value === value).length;
    }

    public isRolled(): boolean {
        return this.every((die) => die.value !== null);
    }
}
