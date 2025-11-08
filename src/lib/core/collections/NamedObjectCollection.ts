import { Collection } from 'discord.js';
import type { HasName } from '../contracts';

export class NamedObjectCollection<T extends HasName> extends Collection<string, T> {
    public constructor(...items: T[]) {
        super(items.map(item => [item.name, item]));
    }
}
