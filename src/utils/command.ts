import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    ContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    RESTPostAPIBaseApplicationCommandsJSONBody,
    UserContextMenuCommandInteraction,
} from 'discord.js';
import { ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder } from 'discord.js';
import { localize } from '.';

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

    public abstract execute(interaction: CommandInteraction): Promise<void>;
}

export abstract class SlashCommand extends BaseApplicationCommand {
    public override readonly data: SlashCommandBuilder;

    public constructor(name: string) {
        super(ApplicationCommandType.ChatInput);

        this.data = localize(SlashCommandBuilder, name, name);
    }

    public abstract override execute(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
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

    public abstract override execute(interaction: ContextMenuCommandInteraction): Promise<void>;
}

export abstract class UserContextMenu extends ContextMenu {
    public constructor(name: string) {
        super(name, ApplicationCommandType.User);
    }

    public abstract override execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}

export abstract class MessageContextMenu extends ContextMenu {
    public constructor(name: string) {
        super(name, ApplicationCommandType.Message);
    }

    public abstract override execute(
        interaction: MessageContextMenuCommandInteraction,
    ): Promise<void>;
}
