import type { Definition } from '../../modules/urban-dictionary';

export class HistoryItem {
    public readonly term: string;
    public readonly definitions: Definition[];
    public index: number;

    public constructor(term: string, definitions: Definition[]) {
        this.term = term;
        this.definitions = definitions;
        this.index = 0;
    }

    public getDefinition(): Definition | null {
        return this.definitions[this.index] ?? null;
    }
}
