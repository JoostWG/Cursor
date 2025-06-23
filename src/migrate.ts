import type { SchemaModule } from 'kysely';
import { V1 } from './database/migrations/v1';
import { V2 } from './database/migrations/v2';
import { V3 } from './database/migrations/v3';
import { createDatabaseInstance, type CursorDatabase } from './setup';

export abstract class Migration {
    public abstract up(schema: SchemaModule): Promise<void>;
    public abstract down(schema: SchemaModule): Promise<void>;
}

export class Migrator {
    public constructor(
        private readonly db: CursorDatabase,
        private readonly migrations: Map<string, Migration>,
    ) {}

    public async migrate(action: 'up' | 'down') {
        await this.createMigrationTable().ifNotExists().execute();

        if (action === 'up') {
            await this.up();
        } else {
            await this.down();
        }
    }

    private async up() {
        const existingMigrations = await this.db.selectFrom('migrations').selectAll().execute();

        const existingNames = existingMigrations.map((migration) => migration.name);
        const lastBatchNumber = existingMigrations.length
            ? Math.max(...existingMigrations.map((migration) => migration.batch))
            : 0;

        for await (const [name, migration] of this.migrations) {
            if (existingNames.includes(name)) {
                continue;
            }

            console.info(`Migrating ${name}`);

            try {
                await this.db.transaction().execute(async (transaction) => {
                    await migration.up(transaction.schema);
                    await transaction
                        .insertInto('migrations')
                        .values({
                            name,
                            batch: lastBatchNumber + 1,
                        })
                        .execute();
                });
            } catch (error) {
                console.error(`Failed to migrate ${name}!`);
                throw error;
            }
        }
    }

    private async down() {
        const latestBatch = await this.db
            .selectFrom('migrations')
            .selectAll()
            .where(
                'batch',
                '=',
                this.db
                    .selectFrom('migrations')
                    .select(({ fn }) => fn.max('batch').as('max_batch')),
            )
            .orderBy('id', 'desc')
            .execute();

        for (const migration of latestBatch) {
            const migrationInstance = this.migrations.get(migration.name);

            if (!migrationInstance) {
                console.error(`No migration instance found for ${migration.name}`);
                return;
            }

            console.info(`Rollingback ${migration.name}`);

            try {
                await this.db.transaction().execute(async (transaction) => {
                    await migrationInstance.down(transaction.schema);
                    await transaction
                        .deleteFrom('migrations')
                        .where('id', '=', migration.id)
                        .execute();
                });
            } catch (error) {
                console.error(`Failed to rollback ${migration.name}!`);
                throw error;
            }
        }
    }

    private createMigrationTable() {
        return this.db.schema
            .createTable('migrations')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('batch', 'integer', (col) => col.unsigned().notNull());
    }
}

(async () => {
    if (process.argv.includes('--up') && process.argv.includes('--down')) {
        console.error('Cannot use both --up and --down');
        return;
    }

    const migrator = new Migrator(
        createDatabaseInstance(),
        new Map([
            ['v1', new V1()],
            ['v2', new V2()],
            ['v3', new V3()],
        ]),
    );

    if (process.argv.includes('--up')) {
        await migrator.migrate('up');
    } else if (process.argv.includes('--down')) {
        await migrator.migrate('down');
    }
})();
