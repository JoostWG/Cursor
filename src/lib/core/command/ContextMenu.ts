import type {
    ContextMenuCommandInteraction,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import type { BaseContext } from '../context';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class ContextMenu<
    TContext extends BaseContext<ContextMenuCommandInteraction> = BaseContext<
        ContextMenuCommandInteraction
    >,
> extends BaseApplicationCommand<
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    TContext
> {
    //
}
