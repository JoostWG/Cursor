import {
    ApplicationCommandType,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { ContextMenu } from './ContextMenu';

export abstract class UserContextMenu extends ContextMenu<UserContextMenuCommandInteraction> {
    public override getData(): RESTPostAPIContextMenuApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        return {
            type: ApplicationCommandType.User,
            ...this.definition(),
        };
    }
}
