import {
    ApplicationCommandType,
    type CommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import type { OmitType } from '../../utils';
import type { MessageContextMenu } from './MessageContextMenu';
import type { SlashCommand } from './SlashCommand';
import type { UserContextMenu } from './UserContextMenu';

export abstract class BaseApplicationCommand<
    TData extends RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody,
    TInteraction extends CommandInteraction = CommandInteraction,
> {
    public devOnly?: boolean;

    public getType(): ApplicationCommandType {
        return this.getData().type;
    }

    public isSlashCommand(): this is SlashCommand {
        return this.getType() === ApplicationCommandType.ChatInput;
    }

    public isUserContextMenu(): this is UserContextMenu {
        return this.getType() === ApplicationCommandType.User;
    }

    public isMessageContextMenu(): this is MessageContextMenu {
        return this.getType() === ApplicationCommandType.Message;
    }

    public isContextMenu(): this is UserContextMenu | MessageContextMenu {
        return this.isUserContextMenu() || this.isMessageContextMenu();
    }

    public async invoke(interaction: TInteraction): Promise<void> {
        await this.handle(interaction);
    }

    public abstract getData(): TData & { type: ApplicationCommandType };
    protected abstract handle(interaction: TInteraction): Promise<void>;
    protected abstract definition(): OmitType<TData>;
}
