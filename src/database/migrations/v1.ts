import { sql, type SchemaModule } from 'kysely';
import type { Migration } from '../../migrate';

export class V1 implements Migration {
    public async up(schema: SchemaModule): Promise<void> {
        await schema
            .createTable('tags')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('guild_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('name', 'varchar(255)', (col) => col.notNull())
            .addColumn('content', 'text', (col) => col.notNull())
            .addColumn('uses', 'integer', (col) => col.unsigned().defaultTo(0))
            .addColumn(
                'created_at',
                'text',
                (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
            )
            .addUniqueConstraint('guild_id_name', ['guild_id', 'name'])
            .execute();
    }

    public async down(schema: SchemaModule): Promise<void> {
        await schema.dropTable('tags').execute();
    }
}
