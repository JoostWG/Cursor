import {
    ApplicationCommandType,
    type MessageContextMenuCommandInteraction,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { ContextMenu } from './ContextMenu';

export abstract class MessageContextMenu extends ContextMenu<MessageContextMenuCommandInteraction> {
    public override getData(): RESTPostAPIContextMenuApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        return {
            type: ApplicationCommandType.Message,
            ...this.definition(),
        };
    }
}
