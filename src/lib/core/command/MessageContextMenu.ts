import {
    ApplicationCommandType,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import type { MessageContextMenuContext } from '../context';
import { ContextMenu } from './ContextMenu';

export abstract class MessageContextMenu extends ContextMenu<MessageContextMenuContext> {
    public override getData(): RESTPostAPIContextMenuApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        return {
            type: ApplicationCommandType.Message,
            ...this.definition(),
        };
    }
}
