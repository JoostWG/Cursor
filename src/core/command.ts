import {
    ApplicationCommandType,
    InteractionContextType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type CommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import type { OmitType } from '../types';
import type {
    ChatInputContext,
    Context,
    ContextMenuContext,
    MessageContextMenuContext,
    UserContextMenuContext,
} from './context';

export class CommandError extends Error {
    //
}

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

    public abstract execute(ctx: Context<CommandInteraction>): Promise<void>;
}

export abstract class SlashCommand extends BaseApplicationCommand<RESTPostAPIChatInputApplicationCommandsJSONBody> {
    public constructor(data: OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.ChatInput,
            ...data,
        });
    }

    public abstract override execute(ctx: ChatInputContext): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}

export abstract class GuildSlashCommand extends SlashCommand {
    public constructor(
        data: Omit<OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody>, 'contexts'>,
    ) {
        super({ contexts: [InteractionContextType.Guild], ...data });
    }
}

export abstract class ContextMenu extends BaseApplicationCommand<RESTPostAPIContextMenuApplicationCommandsJSONBody> {
    public abstract override execute(ctx: ContextMenuContext): Promise<void>;
}

export abstract class UserContextMenu extends ContextMenu {
    public constructor(data: OmitType<RESTPostAPIApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.User,
            ...data,
        });
    }

    public abstract override execute(ctx: UserContextMenuContext): Promise<void>;
}

export abstract class MessageContextMenu extends ContextMenu {
    public constructor(data: OmitType<RESTPostAPIApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.Message,
            ...data,
        });
    }

    public abstract override execute(ctx: MessageContextMenuContext): Promise<void>;
}
