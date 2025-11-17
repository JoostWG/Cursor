import SQLite from 'better-sqlite3';
import { Client, Events, GatewayIntentBits, type CommandInteraction } from 'discord.js';
import { Kysely, SqliteDialect } from 'kysely';
import { CommandDataCache } from './CommandDataCache';
import { CommandDeployHandler } from './CommandDeployHandler';
import { CommandError } from './CommandError';
import {
    ChessCommand,
    EconomyCommand,
    F1Command,
    JokeCommand,
    PingCommand,
    RawCommand,
    RockPaperScissorsCommand,
    RoleCommand,
    TagCommand,
    TriviaCommand,
    UrbanDictionaryCommand,
    UserCommand,
    YahtzeeCommand,
} from './commands';
import { SudokuCommand } from './commands/sudoku';
import type { CursorDatabase, DatabaseTables } from './database';
import { ApplicationCommandCollection, Bot, type ApplicationCommandError } from './lib/core';

export class CursorBot extends Bot {
    public readonly db: CursorDatabase;
    private readonly deployHandler: CommandDeployHandler;

    public constructor(token: string) {
        super({
            client: new Client({
                intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
            }),
            token,
        });

        this.db = new Kysely<DatabaseTables>({
            dialect: new SqliteDialect({
                database: new SQLite('./database/database.db'),
            }),
        });

        this.deployHandler = new CommandDeployHandler(
            new CommandDataCache('./cache/deployed-commands'),
            this.client.rest,
            this.applicationCommands(),
        );

        this.client.on(Events.ClientReady, () => {
            console.info('Ready');
        });
    }

    public override async start(): Promise<void> {
        await this.deployHandler.deployIfNeeded();

        await super.start();
    }

    protected override applicationCommands(): ApplicationCommandCollection {
        return new ApplicationCommandCollection(
            // Chat
            new ChessCommand(),
            new EconomyCommand(this.db),
            new F1Command(),
            new JokeCommand(),
            new PingCommand(),
            new RoleCommand(),
            new RockPaperScissorsCommand(this.db),
            new SudokuCommand(),
            new TagCommand(this.db),
            new TriviaCommand(),
            new UrbanDictionaryCommand(),
            new UserCommand(),
            new YahtzeeCommand(),
            // Context
            new RawCommand(),
        );
    }

    protected override async onApplicationCommand(interaction: CommandInteraction): Promise<void> {
        await this.db
            .insertInto('command_logs')
            .values({
                interaction_id: interaction.id,
                user_id: interaction.user.id,
                channel_id: interaction.channelId,
                guild_id: interaction.inGuild() ? interaction.guildId : null,
                command_name: interaction.commandName,
                command_type: interaction.commandType,
                options: JSON.stringify(
                    interaction.isChatInputCommand() ? interaction.options.data : [],
                ),
            })
            .execute();
    }

    protected override async onApplicationCommandError(
        { interaction, cause }: ApplicationCommandError,
    ): Promise<void> {
        if (!(cause instanceof CommandError)) {
            return;
        }

        if (!interaction.isRepliable()) {
            return;
        }

        await interaction.reply(cause.message);
    }
}
