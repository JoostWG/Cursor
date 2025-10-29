import { Collection } from 'discord.js';
import { Api, type Definition } from '../../modules/urban-dictionary';

export class CachedApi extends Api {
    private readonly definitionsCache: Collection<string, Promise<Definition[]>>;
    private readonly autocompleteCache: Collection<string, Promise<string[]>>;

    public constructor() {
        super();

        this.definitionsCache = new Collection();
        this.autocompleteCache = new Collection();
    }

    public override async define(term: string): Promise<Definition[]> {
        return await this.definitionsCache.ensure(term, async () => await super.define(term));
    }

    public override async autocomplete(term: string): Promise<string[]> {
        return await this.autocompleteCache.ensure(
            term,
            async () => await super.autocomplete(term),
        );
    }
}
