import type {
    ContextMenuCommandInteraction,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class ContextMenu<
    TInteraction extends ContextMenuCommandInteraction = ContextMenuCommandInteraction,
> extends BaseApplicationCommand<
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    TInteraction
> {
    //
}
