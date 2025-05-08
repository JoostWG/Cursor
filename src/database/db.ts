import type { Database } from './database';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

export const db = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: new SQLite('./database/database.db'),
    }),
});
