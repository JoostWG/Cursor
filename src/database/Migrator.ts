import type { CursorDatabase } from './database';
import type { Migration } from './Migration';

export class Migrator {
    public constructor(
        private readonly db: CursorDatabase,
        private readonly migrations: Map<string, Migration>,
    ) {}

    public async migrate(action: 'up' | 'down'): Promise<void> {
        await this.createMigrationTable().ifNotExists().execute();

        if (action === 'up') {
            await this.up();
        } else {
            await this.down();
        }
    }

    private async up(): Promise<void> {
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

    private async down(): Promise<void> {
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

            console.info(`Rolling back ${migration.name}`);

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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    private createMigrationTable() {
        return this.db.schema
            .createTable('migrations')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
            .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('batch', 'integer', (col) => col.unsigned().notNull());
    }
}
