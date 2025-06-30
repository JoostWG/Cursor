import SQLite from 'better-sqlite3';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Kysely, SqliteDialect } from 'kysely';
import { ChessCommand } from './commands/chess';
import { RawCommand } from './commands/context/message/raw';
import { JokeCommand } from './commands/joke';
import { PingCommand } from './commands/ping';
import { RoleCommand } from './commands/role';
import { RockPaperScissorsCommand } from './commands/rps';
import { TagCommand } from './commands/tag';
import { TriviaCommand } from './commands/trivia';
import { UrbanDictionaryCommand } from './commands/urban-dictionary';
import { UserCommand } from './commands/user';
import { YahtzeeCommand } from './commands/yahtzee';
import { Bot } from './core/bot';
import { CommandCollection } from './core/command-collection';
import { CommandDataCache, CommandDeployHandler } from './core/command-deploy-handler';
import type { DatabaseTables } from './types/database';

export type CursorDatabase = Kysely<DatabaseTables>;

export function createDatabaseInstance(): Kysely<DatabaseTables> {
    return new Kysely<DatabaseTables>({
        dialect: new SqliteDialect({
            database: new SQLite('./database/database.db'),
        }),
    });
}

export async function createBot({ token }: { token: string }): Promise<Bot> {
    const client = new Client({
        intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
    });

    client.on(Events.ClientReady, () => {
        console.info('Ready!');
    });

    client.on(Events.Error, console.error);

    const db = createDatabaseInstance();

    const commands = new CommandCollection([
        new RawCommand(),
        new ChessCommand(),
        JokeCommand.create(),
        new PingCommand(),
        new RoleCommand(),
        new RockPaperScissorsCommand(db),
        TagCommand.create({ db }),
        new TriviaCommand(),
        UrbanDictionaryCommand.create(),
        new UserCommand(),
        new YahtzeeCommand(),
    ]);

    return new Bot({
        token,
        client,
        commands,
        db,
        deployHandler: new CommandDeployHandler(
            new CommandDataCache('./cache/deployed-commands'),
            client.rest,
            commands,
        ),
    });
}
