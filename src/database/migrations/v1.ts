import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import type { Database } from '../database';

export default {
    async up(db: Kysely<Database>) {
        await db.schema
            .createTable('tags')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('guild_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('name', 'varchar(255)', (col) => col.notNull())
            .addColumn('content', 'text', (col) => col.notNull())
            .addColumn('uses', 'integer', (col) => col.unsigned().defaultTo(0))
            .addColumn('created_at', 'text', (col) =>
                col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .addUniqueConstraint('guild_id_name', ['guild_id', 'name'])
            .execute();
    },

    async down(db: Kysely<Database>) {
        await db.schema.dropTable('tag').execute();
    },
};
