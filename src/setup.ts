import SQLite from 'better-sqlite3';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Kysely, SqliteDialect } from 'kysely';
import ChessCommand from './commands/chess';
import RawCommand from './commands/context/message/raw';
import JokeCommand from './commands/joke';
import PingCommand from './commands/ping';
import RoleCommand from './commands/role';
import RockPaperScissorsCommand from './commands/rps';
import TagCommand from './commands/tag';
import TriviaCommand from './commands/trivia';
import UrbanDictionaryCommand from './commands/urban-dictionary';
import UserCommand from './commands/user';
import { Bot } from './core/bot';
import { CommandCollection } from './core/command-collection';
import type { DatabaseTables } from './types/database';
import { initI18Next } from './utils';

export type CursorDatabase = Kysely<DatabaseTables>;

export function createDatabaseInstance() {
    return new Kysely<DatabaseTables>({
        dialect: new SqliteDialect({
            database: new SQLite('./database/database.db'),
        }),
    });
}

export async function createBot() {
    await initI18Next();

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
        new JokeCommand(),
        new PingCommand(),
        new RoleCommand(),
        new RockPaperScissorsCommand(db),
        new TagCommand(db),
        new TriviaCommand(),
        new UrbanDictionaryCommand(),
        new UserCommand(),
    ]);

    return new Bot({
        client,
        commands,
        db,
    });
}
