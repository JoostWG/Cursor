import type {
    ChatInputCommandInteraction,
    CommandInteraction,
    ContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
} from 'discord.js';

export class Context<T extends CommandInteraction> {
    public constructor(public readonly interaction: T) {}
}

export class ChatInputContext extends Context<ChatInputCommandInteraction> {
    //
}

export class ContextMenuContext<
    T extends ContextMenuCommandInteraction = ContextMenuCommandInteraction,
> extends Context<T> {
    //
}

export class UserContextMenuContext extends ContextMenuContext<UserContextMenuCommandInteraction> {
    //
}

export class MessageContextMenuContext
    extends ContextMenuContext<MessageContextMenuCommandInteraction>
{
    //
}
