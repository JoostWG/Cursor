import type { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import type { OmitType } from '../../utils';
import type { BaseContext } from '../context';
import type { HasName } from '../contracts';
import { CommandHandlerNotFoundError } from '../errors';
import { ContextMenu } from './ContextMenu';
import { MessageContextMenu } from './MessageContextMenu';
import { SlashCommand } from './SlashCommand';
import { UserContextMenu } from './UserContextMenu';

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
        return this instanceof SlashCommand;
    }

    public isUserContextMenu(): this is UserContextMenu {
        return this instanceof UserContextMenu;
    }

    public isMessageContextMenu(): this is MessageContextMenu {
        return this instanceof MessageContextMenu;
    }

    public isContextMenu(): this is ContextMenu {
        return this instanceof ContextMenu;
    }

    public async invoke(ctx: TContext): Promise<void> {
        if (!this.handle) {
            throw new CommandHandlerNotFoundError(ctx.interaction);
        }

        await this.handle(ctx);
    }

    public abstract getData(): TData & { type: ApplicationCommandType };
    protected handle?(ctx: TContext): Promise<void>;
    protected abstract definition(): OmitType<TData>;
}
