import { Collection } from 'discord.js';
import type { CursorDatabase } from '../setup';
import type { BaseApplicationCommand } from './command';
import { AutocompleteListener } from './listeners/autocomplete-listener';
import { CommandListener } from './listeners/command-listener';

export class CommandCollection<
    T extends BaseApplicationCommand = BaseApplicationCommand,
> extends Collection<string, T> {
    public constructor(commands: T[]) {
        super(commands.map((command) => [command.data.name, command]));
    }

    public createListeners(db: CursorDatabase) {
        return [new CommandListener(this, db), new AutocompleteListener(this)] as const;
    }
}
