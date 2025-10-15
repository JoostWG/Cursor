import type { DieValue } from './types';

export class Die {
    #value: DieValue | null;
    #isLocked: boolean;

    public constructor(value?: DieValue) {
        this.#value = value ?? null;
        this.#isLocked = false;
    }

    public get value(): DieValue | null {
        return this.#value;
    }

    public isLocked(): boolean {
        return this.#isLocked;
    }

    public roll(): void {
        if (this.#value && this.#isLocked) {
            return;
        }

        this.#value = (Math.floor(Math.random() * 6) + 1) as DieValue;
        this.#isLocked = false;
    }

    public lock(): void {
        this.#isLocked = true;
    }

    public unlock(): void {
        this.#isLocked = false;
    }

    public toggleLocked(): void {
        this.#isLocked = !this.#isLocked;
    }

    public reset(): void {
        this.#value = null;
        this.#isLocked = false;
    }
}
