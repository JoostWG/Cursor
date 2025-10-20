import { Collection } from 'discord.js';
import type { CursorDatabase } from '../setup';
import type { BaseApplicationCommand } from './command';
import type { EventListener } from './event-listener';
import { AutocompleteListener } from './listeners/AutocompleteListener';
import { CommandListener } from './listeners/CommandListener';

export class CommandCollection<
    T extends BaseApplicationCommand = BaseApplicationCommand,
> extends Collection<string, T> {
    public constructor(commands: T[]) {
        super(commands.map((command) => [command.data.name, command]));
    }

    public createListeners(db: CursorDatabase): EventListener[] {
        return [new CommandListener(this, db), new AutocompleteListener(this)] as const;
    }
}
