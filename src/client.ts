import {
    type ClientOptions,
    Collection,
    Client as DiscordJsClient,
    Events,
    GatewayIntentBits,
    MessageFlags,
} from 'discord.js';
import { db } from './database/db';
import { getCommands } from './utils';
import { type BaseApplicationCommand, CommandError } from './utils/command';

export class Client extends DiscordJsClient {
    private readonly commands: Collection<string, BaseApplicationCommand>;

    public constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();

        void this.loadCommands();
    }

    public getCommand(name: string) {
        return this.commands.get(name);
    }

    private async loadCommands() {
        for await (const command of getCommands()) {
            try {
                this.commands.set(command.data.name, command);
            } catch {
                //
            }
        }
    }
}

const client = new Client({
    intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
});

client.on(Events.ClientReady, async () => {
    console.info('Ready!');
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.getCommand(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        db.insertInto('command_logs')
            .values({
                interaction_id: interaction.id,
                user_id: interaction.user.id,
                channel_id: interaction.channelId,
                guild_id: interaction.inGuild() ? interaction.guildId : null,
                command_name: interaction.commandName,
                command_type: interaction.commandType,
                options: JSON.stringify(interaction.options.data),
            })
            .execute()
            .catch(console.error);

        try {
            await command.execute(interaction);
        } catch (error) {
            let message: string;

            if (error instanceof CommandError) {
                message = `⚠️ ${error.message}`;
            } else {
                message = 'There was an error while executing this command!';
                console.error(error);
            }

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: message,
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: message,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    } else if (interaction.isAutocomplete()) {
        const command = client.getCommand(interaction.commandName);
        if (!command?.isSlashCommand() || !command.autocomplete) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            const results = await command.autocomplete(interaction);
            await interaction.respond(results.slice(0, 25));
        } catch (error) {
            console.error(error);
        }
    }
});

export default client;
