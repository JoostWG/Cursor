import {
    ApplicationCommandType,
    type CommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import type { Context } from '../context';
import type { MessageContextMenu } from './MessageContextMenu';
import type { SlashCommand } from './SlashCommand';
import type { UserContextMenu } from './UserContextMenu';

export abstract class BaseApplicationCommand<
    T extends RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody,
> {
    public readonly type: ApplicationCommandType;
    public devOnly?: boolean;
    public readonly data: T;

    public constructor(data: T & { type: ApplicationCommandType }) {
        this.data = data;
        this.type = data.type;
    }

    public isSlashCommand(): this is SlashCommand {
        return this.type === ApplicationCommandType.ChatInput;
    }

    public isUserContextMenu(): this is UserContextMenu {
        return this.type === ApplicationCommandType.User;
    }

    public isMessageContextMenu(): this is MessageContextMenu {
        return this.type === ApplicationCommandType.Message;
    }

    public isContextMenu(): this is UserContextMenu | MessageContextMenu {
        return this.isUserContextMenu() || this.isMessageContextMenu();
    }

    public abstract handle(ctx: Context<CommandInteraction>): Promise<void>;
}
