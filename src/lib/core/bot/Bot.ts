import {
    Events,
    MessageFlags,
    type AutocompleteInteraction,
    type Client,
    type CommandInteraction,
} from 'discord.js';
import { ApplicationCommandCollection } from '../collections';
import { ApplicationCommandError, CommandHandlerNotFoundError } from '../errors';

export abstract class Bot {
    public readonly client: Client;
    private readonly token: string;

    public constructor({ client, token }: { client: Client; token: string }) {
        this.client = client;
        this.token = token;

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
    protected async onApplicationCommand(interaction: CommandInteraction): Promise<void> {
        //
    }

    protected applicationCommands(): ApplicationCommandCollection {
        return new ApplicationCommandCollection();
    }

    private async handleCommandInteraction(interaction: CommandInteraction): Promise<void> {
        const command = this.applicationCommands().get(interaction.commandName);

        if (!command) {
            throw new CommandHandlerNotFoundError(interaction);
        }

        await this.onApplicationCommand(interaction).catch(console.error);

        try {
            if (interaction.isChatInputCommand() && command.isSlashCommand()) {
                await command.invoke(interaction);
                return;
            }

            if (interaction.isUserContextMenuCommand() && command.isUserContextMenu()) {
                await command.invoke(interaction);
                return;
            }

            if (
                interaction.isMessageContextMenuCommand()
                && command.isMessageContextMenu()
            ) {
                await command.invoke(interaction);
                return;
            }
        } catch (cause) {
            if (cause instanceof CommandHandlerNotFoundError) {
                throw cause;
            }

            // TODO
            const error = new ApplicationCommandError(interaction, undefined, cause);

            await this.onApplicationCommandError(error);

            return;
        }

        throw new CommandHandlerNotFoundError(interaction);
    }

    private async handleAutocompleteInteraction(
        interaction: AutocompleteInteraction,
    ): Promise<void> {
        const command = this.applicationCommands().get(interaction.commandName);

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
