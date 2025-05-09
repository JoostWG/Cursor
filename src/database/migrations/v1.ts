import { defineTables } from '../../migrate';

export default defineTables({
    tags: (builder) =>
        builder
            .addColumn('guild_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('name', 'varchar(255)', (col) => col.notNull())
            .addColumn('content', 'text', (col) => col.notNull())
            .addColumn('uses', 'integer', (col) => col.unsigned().defaultTo(0))
            .addUniqueConstraint('guild_id_name', ['guild_id', 'name']),
});
