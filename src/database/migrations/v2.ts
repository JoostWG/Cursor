import { sql, type SchemaModule } from 'kysely';
import type { Migration } from '../../migrate';

export class V2 implements Migration {
    public async up(schema: SchemaModule): Promise<void> {
        await schema
            .createTable('rps_games')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('created_at', 'text', (col) =>
                col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .execute();

        await schema
            .createTable('rps_game_user')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('rps_game_id', 'integer', (col) =>
                col.notNull().references('rps_games.id').onDelete('cascade'),
            )
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('created_at', 'text', (col) =>
                col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .execute();

        await schema
            .createTable('rps_rounds')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('rps_game_id', 'integer', (col) =>
                col.notNull().references('rps_games.id').onDelete('cascade'),
            )
            .addColumn('nr', 'integer', (col) => col.unsigned().notNull())
            .addColumn('created_at', 'text', (col) =>
                col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .execute();

        await schema
            .createTable('rps_choices')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('rps_round_id', 'integer', (col) =>
                col.notNull().references('rps_rounds.id').onDelete('cascade'),
            )
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('choice', 'varchar(255)', (col) => col.notNull())
            .addColumn('created_at', 'text', (col) =>
                col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .execute();
    }

    public async down(schema: SchemaModule): Promise<void> {
        await schema.dropTable('rps_choices').execute();
        await schema.dropTable('rps_rounds').execute();
        await schema.dropTable('rps_game_user').execute();
        await schema.dropTable('rps_games').execute();
    }
}
