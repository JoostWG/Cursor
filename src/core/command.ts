import {
    type ApplicationCommandOptionChoiceData,
    ApplicationCommandType,
    type AutocompleteInteraction,
    type CommandInteraction,
    ContextMenuCommandBuilder,
    InteractionContextType,
    type RESTPostAPIBaseApplicationCommandsJSONBody,
    SlashCommandBuilder,
} from 'discord.js';
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

export abstract class BaseApplicationCommand {
    public readonly type: ApplicationCommandType;
    public devOnly?: boolean;
    public abstract readonly data: {
        name: string;
        toJSON: () => RESTPostAPIBaseApplicationCommandsJSONBody;
    };

    public constructor(type: ApplicationCommandType) {
        this.type = type;
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

export abstract class SlashCommand extends BaseApplicationCommand {
    public override readonly data: SlashCommandBuilder;

    public constructor(name: string, description: string) {
        super(ApplicationCommandType.ChatInput);

        this.data = new SlashCommandBuilder().setName(name).setDescription(description);
    }

    public abstract override execute(ctx: ChatInputContext): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}

export abstract class GuildSlashCommand extends SlashCommand {
    public constructor(name: string, description: string) {
        super(name, description);

        this.data.setContexts(InteractionContextType.Guild);
    }
}

export abstract class ContextMenu extends BaseApplicationCommand {
    public override readonly data: ContextMenuCommandBuilder;

    public constructor(
        name: string,
        type: ApplicationCommandType.User | ApplicationCommandType.Message,
    ) {
        super(type);

        this.data = new ContextMenuCommandBuilder().setName(name).setType(type);
    }

    public abstract override execute(ctx: ContextMenuContext): Promise<void>;
}

export abstract class UserContextMenu extends ContextMenu {
    public constructor(name: string) {
        super(name, ApplicationCommandType.User);
    }

    public abstract override execute(ctx: UserContextMenuContext): Promise<void>;
}

export abstract class MessageContextMenu extends ContextMenu {
    public constructor(name: string) {
        super(name, ApplicationCommandType.Message);
    }

    public abstract override execute(ctx: MessageContextMenuContext): Promise<void>;
}
