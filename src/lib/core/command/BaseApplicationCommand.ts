import { ApplicationCommandType, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import type { OmitType } from '../../utils';
import type { BaseContext } from '../context';
import type { HasName } from '../contracts';
import { CommandHandlerNotFoundError } from '../errors';
import type { MessageContextMenu } from './MessageContextMenu';
import type { SlashCommand } from './SlashCommand';
import type { UserContextMenu } from './UserContextMenu';

export abstract class BaseApplicationCommand<
    TData extends RESTPostAPIApplicationCommandsJSONBody = RESTPostAPIApplicationCommandsJSONBody,
    TContext extends BaseContext = BaseContext,
> implements HasName {
    public devOnly?: boolean;

    public get name(): string {
        return this.getData().name;
    }

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

    public async invoke(context: TContext): Promise<void> {
        if (!this.handle) {
            throw new CommandHandlerNotFoundError(context.interaction);
        }

        await this.handle(context);
    }

    public abstract getData(): TData & { type: ApplicationCommandType };
    protected handle?(context: TContext): Promise<void>;
    protected abstract definition(): OmitType<TData>;
}
