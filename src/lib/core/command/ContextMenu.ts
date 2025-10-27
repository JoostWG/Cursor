import type {
    ContextMenuCommandInteraction,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class ContextMenu
    extends BaseApplicationCommand<RESTPostAPIContextMenuApplicationCommandsJSONBody>
{
    public abstract override handle(interaction: ContextMenuCommandInteraction): Promise<void>;
}
