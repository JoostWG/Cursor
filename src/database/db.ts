import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database } from '../types/database';

export const db = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: new SQLite('./database/database.db'),
    }),
});
