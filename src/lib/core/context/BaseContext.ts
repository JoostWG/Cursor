import type { CommandInteraction } from 'discord.js';
import type { Bot } from '../bot';
import type { BaseApplicationCommand } from '../command';

export abstract class BaseContext<
    TInteraction extends CommandInteraction = CommandInteraction,
> {
    public readonly bot: Bot;
    public readonly interaction: TInteraction;
    public readonly command: BaseApplicationCommand;

    public constructor(options: {
        bot: Bot;
        interaction: TInteraction;
        command: BaseApplicationCommand;
    }) {
        this.bot = options.bot;
        this.interaction = options.interaction;
        this.command = options.command;
    }

    public async invoke(): Promise<void> {
        await this.command.invoke(this);
    }
}
