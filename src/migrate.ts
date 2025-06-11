import fs from 'fs/promises';
import { type CreateTableBuilder, type SchemaModule, sql } from 'kysely';
import path from 'path';
import { pathToFileURL } from 'url';
import client from './client';

const dirPath = path.join(__dirname, './database/migrations');

type MigrationCallback = (schema: SchemaModule) => Promise<void>;

interface MigrationOptions {
    up: MigrationCallback;
    down: MigrationCallback;
}

class Migration {
    readonly #up: MigrationCallback;
    readonly #down: MigrationCallback;

    public constructor(options: MigrationOptions) {
        this.#up = options.up;
        this.#down = options.down;
    }

    public get up() {
        return this.#up;
    }

    public get down() {
        return this.#down;
    }
}

export function defineMigration(options: MigrationOptions) {
    return new Migration(options);
}

export function defineTables(
    tables: Record<
        string,
        (builder: CreateTableBuilder<string, 'id'>) => CreateTableBuilder<string>
    >,
) {
    return defineMigration({
        async up(schema) {
            for (const name of Object.keys(tables)) {
                await tables[name](
                    schema
                        .createTable(name)
                        .addColumn('id', 'integer', (col) =>
                            col.primaryKey().autoIncrement().notNull(),
                        ),
                )
                    .addColumn('created_at', 'text', (col) =>
                        col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
                    )
                    .execute();
            }
        },

        async down(schema) {
            for (const name of Object.keys(tables).toReversed()) {
                await schema.dropTable(name).execute();
            }
        },
    });
}

(async () => {
    // Create migrations table if it doesn't already exist
    await client.db.schema
        .createTable('migrations')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
        .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('batch', 'integer', (col) => col.unsigned().notNull())
        .execute();

    if (process.argv.includes('--up') && process.argv.includes('--down')) {
        console.error('Cannot use both --up and --down');
        return;
    }

    const existingMigrations = await client.db.selectFrom('migrations').selectAll().execute();

    const migrationInstances = new Map<string, Migration>();

    // Collect all migration instances from migrations directory
    for (const dirent of await fs.readdir(dirPath, {
        withFileTypes: true,
    })) {
        if (dirent.isDirectory()) {
            continue;
        }

        const module = await import(pathToFileURL(path.join(dirPath, dirent.name)).href);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const migration = module.default.default;

        if (migration instanceof Migration) {
            migrationInstances.set(dirent.name, migration);
        }
    }

    if (process.argv.includes('--up')) {
        const existingNames = existingMigrations.map((migration) => migration.name);
        const lastBatchNumber = existingMigrations.length
            ? Math.max(...existingMigrations.map((migration) => migration.batch))
            : 0;

        for await (const [name, migration] of migrationInstances) {
            if (existingNames.includes(name)) {
                continue;
            }

            console.info(`Migrating ${name}`);

            try {
                await client.db.transaction().execute(async (transaction) => {
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

    if (process.argv.includes('--down')) {
        const latestBatch = await client.db
            .selectFrom('migrations')
            .selectAll()
            .where(
                'batch',
                '=',
                client.db
                    .selectFrom('migrations')
                    .select(({ fn }) => fn.max('batch').as('max_batch')),
            )
            .orderBy('id', 'desc')
            .execute();

        for (const migration of latestBatch) {
            const migrationInstance = migrationInstances.get(migration.name);

            if (!migrationInstance) {
                console.error(`No migration instance found for ${migration.name}`);
                return;
            }

            console.info(`Rollingback ${migration.name}`);

            try {
                await client.db.transaction().execute(async (transaction) => {
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
})();
