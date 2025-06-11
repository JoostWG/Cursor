import SQLite from 'better-sqlite3';
import {
    type AutocompleteInteraction,
    Collection,
    type CommandInteraction,
    Client as DiscordJsClient,
    type ClientOptions as DiscordJsClientOptions,
    Events,
    GatewayIntentBits,
    type Interaction,
    MessageFlags,
} from 'discord.js';
import { Kysely, SqliteDialect } from 'kysely';
import ChessCommand from './commands/chess';
import RawCommand from './commands/context/message/raw';
import JokeCommand from './commands/joke';
import PingCommand from './commands/ping';
import RoleCommand from './commands/role';
import RockPaperScissorsCommand from './commands/rps';
import TagCommand from './commands/tag';
import TriviaCommand from './commands/trivia';
import UrbanDictionaryCommand from './commands/urbanDictionary';
import UserCommand from './commands/user';
import type { DatabaseTables } from './types/database';
import { type BaseApplicationCommand, CommandError } from './utils/command';

export type CursorDatabase = Kysely<DatabaseTables>;

interface ClientOptions extends DiscordJsClientOptions {
    db: CursorDatabase;
    commands: BaseApplicationCommand[];
}

export class Client extends DiscordJsClient {
    public readonly db: CursorDatabase;
    private readonly commands: Collection<string, BaseApplicationCommand>;

    public constructor(options: ClientOptions) {
        super(options);

        this.db = options.db;

        this.commands = new Collection(
            options.commands.map((command) => [command.data.name, command]),
        );

        this.on(Events.ClientReady, () => {
            console.info('Ready!');
        });

        this.on(Events.InteractionCreate, async (interaction) => {
            await this.handleInteraction(interaction);
        });
    }

    public getAllCommands() {
        return this.commands.values();
    }

    // Commmand handling

    private async handleInteraction(interaction: Interaction) {
        if (interaction.isCommand()) {
            await this.handleCommandInteraction(interaction);
        } else if (interaction.isAutocomplete()) {
            await this.handleAutocompleteInteraction(interaction);
        }
    }

    private async handleCommandInteraction(interaction: CommandInteraction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply({
                content: 'Command not found.',
                flags: MessageFlags.Ephemeral,
            });
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        this.db
            .insertInto('command_logs')
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
    }

    private async handleAutocompleteInteraction(interaction: AutocompleteInteraction) {
        const command = this.commands.get(interaction.commandName);
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
}

export function createClient() {
    const db = new Kysely<DatabaseTables>({
        dialect: new SqliteDialect({
            database: new SQLite('./database/database.db'),
        }),
    });

    return new Client({
        intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
        commands: [
            new RawCommand(),
            new ChessCommand(),
            new JokeCommand(),
            new PingCommand(),
            new RoleCommand(),
            new RockPaperScissorsCommand(db),
            new TagCommand(db),
            new TriviaCommand(),
            new UrbanDictionaryCommand(),
            new UserCommand(),
        ],
        db,
    });
}

export default createClient();
