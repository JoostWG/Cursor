import type { SchemaModule } from 'kysely';
import type { Migration } from '../Migration';

export class V4 implements Migration {
    public async up(schema: SchemaModule): Promise<void> {
        await schema
            .createTable('balances')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('balance', 'integer', (col) => col.unsigned().notNull())
            .execute();
    }

    public async down(schema: SchemaModule): Promise<void> {
        await schema.dropTable('balances').execute();
    }
}
