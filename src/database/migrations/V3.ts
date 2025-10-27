import { sql, type SchemaModule } from 'kysely';
import type { Migration } from '../Migration';

export class V3 implements Migration {
    public async up(schema: SchemaModule): Promise<void> {
        await schema
            .createTable('command_logs')
            .addColumn('interaction_id', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('channel_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('guild_id', 'varchar(255)')
            .addColumn('command_name', 'varchar(255)')
            .addColumn('command_type', 'integer', (col) => col.unsigned().notNull())
            .addColumn('options', 'json', (col) => col.notNull())
            .addColumn(
                'created_at',
                'text',
                (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .execute();
    }

    public async down(schema: SchemaModule): Promise<void> {
        await schema.dropTable('command_logs').execute();
    }
}
