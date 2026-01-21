import {
    Events,
    MessageFlags,
    type AutocompleteInteraction,
    type Client,
    type CommandInteraction,
} from 'discord.js';
import { ApplicationCommandCollection } from '../collections';
import type { BaseApplicationCommand } from '../command';
import {
    ChatInputContext,
    MessageContextMenuContext,
    UserContextMenuContext,
    type BaseContext,
} from '../context';
import { ApplicationCommandError, CommandHandlerNotFoundError } from '../errors';

export abstract class Bot {
    public readonly client: Client;
    private readonly token: string;
    readonly #applicationCommands: ApplicationCommandCollection;

    public constructor(options: { client: Client; token: string }) {
        this.client = options.client;
        this.token = options.token;

        this.client.rest.setToken(this.token);

        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.isCommand()) {
                await this.handleCommandInteraction(interaction).catch(console.error);
            }

            if (interaction.isAutocomplete()) {
                await this.handleAutocompleteInteraction(interaction).catch(console.error);
            }
        });

        this.client.on(Events.Error, this.onError.bind(this));

        this.#applicationCommands = this.applicationCommands();
    }

    public async start(): Promise<void> {
        await this.client.login(this.token);
    }

    protected async onApplicationCommandError(error: ApplicationCommandError): Promise<void> {
        console.error(error.cause);

        if (!error.interaction.isChatInputCommand()) {
            return;
        }

        if (error.interaction.replied) {
            return;
        }

        await error.interaction.reply({
            content: 'Something went wrong...',
            flags: [MessageFlags.Ephemeral],
        });
    }

    protected async onError(error: Error): Promise<void> {
        console.error(error);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async onApplicationCommand(ctx: BaseContext): Promise<void> {
        //
    }

    protected applicationCommands(): ApplicationCommandCollection {
        return new ApplicationCommandCollection();
    }

    private getContext(
        interaction: CommandInteraction,
        command: BaseApplicationCommand,
    ): BaseContext {
        if (interaction.isChatInputCommand() && command.isSlashCommand()) {
            return new ChatInputContext({ bot: this, interaction, command });
        }

        if (interaction.isUserContextMenuCommand() && command.isUserContextMenu()) {
            return new UserContextMenuContext({ bot: this, interaction, command });
        }

        if (interaction.isMessageContextMenuCommand() && command.isMessageContextMenu()) {
            return new MessageContextMenuContext({ bot: this, interaction, command });
        }

        throw new CommandHandlerNotFoundError(interaction);
    }

    private async handleCommandInteraction(interaction: CommandInteraction): Promise<void> {
        const command = this.#applicationCommands.get(interaction.commandName);

        if (!command) {
            throw new CommandHandlerNotFoundError(interaction);
        }

        const ctx = this.getContext(interaction, command);

        this.onApplicationCommand(ctx).catch(console.error);

        try {
            await ctx.invoke();
        } catch (cause) {
            const error = new ApplicationCommandError(interaction, undefined, cause);

            await this.onApplicationCommandError(error);
        }
    }

    private async handleAutocompleteInteraction(
        interaction: AutocompleteInteraction,
    ): Promise<void> {
        const command = this.#applicationCommands.get(interaction.commandName);

        if (!command?.isSlashCommand()) {
            throw new CommandHandlerNotFoundError(interaction);
        }

        try {
            const results = await command.invokeAutocomplete(interaction);
            await interaction.respond(results.slice(0, 25));
        } catch (error) {
            console.error(error);
        }
    }
}
