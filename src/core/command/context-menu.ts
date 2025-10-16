import type { RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord.js';
import type { ContextMenuContext } from '../context';
import { BaseApplicationCommand } from './base-application-command';

export abstract class ContextMenu
    extends BaseApplicationCommand<RESTPostAPIContextMenuApplicationCommandsJSONBody>
{
    public abstract override execute(ctx: ContextMenuContext): Promise<void>;
}
