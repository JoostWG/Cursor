import {
    ApplicationCommandType,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import type { UserContextMenuContext } from '../context';
import { ContextMenu } from './ContextMenu';

export abstract class UserContextMenu extends ContextMenu<UserContextMenuContext> {
    public override getData(): RESTPostAPIContextMenuApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        return {
            type: ApplicationCommandType.User,
            ...this.definition(),
        };
    }
}
