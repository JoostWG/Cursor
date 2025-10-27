import type { RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord.js';
import type { ContextMenuContext } from '../context';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class ContextMenu
    extends BaseApplicationCommand<RESTPostAPIContextMenuApplicationCommandsJSONBody>
{
    public abstract override handle(ctx: ContextMenuContext): Promise<void>;
}
