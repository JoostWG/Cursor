/* eslint-disable @typescript-eslint/naming-convention */
import { defineTables } from '../../migrate';

export default defineTables({
    command_logs: (builder) =>
        builder
            .addColumn('interaction_id', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('channel_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('guild_id', 'varchar(255)')
            .addColumn('command_name', 'varchar(255)')
            .addColumn('options', 'json', (col) => col.notNull()),
});
