import { ApplicationCommandType, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import type { OmitType } from '../../types';
import type { MessageContextMenuContext } from '../context';
import { ContextMenu } from './context-menu';

export abstract class MessageContextMenu extends ContextMenu {
    protected constructor(data: OmitType<RESTPostAPIApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.Message,
            ...data,
        });
    }

    public abstract override execute(ctx: MessageContextMenuContext): Promise<void>;
}
