/* eslint-disable @typescript-eslint/naming-convention */
import { defineTables } from '../../migrate';

export default defineTables({
    rps_games: (builder) => builder.addColumn('user_id', 'varchar(255)', (col) => col.notNull()),

    rps_game_user: (builder) =>
        builder
            .addColumn('rps_game_id', 'integer', (col) =>
                col.notNull().references('rps_games.id').onDelete('cascade'),
            )
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull()),

    rps_rounds: (builder) =>
        builder
            .addColumn('rps_game_id', 'integer', (col) =>
                col.notNull().references('rps_games.id').onDelete('cascade'),
            )
            .addColumn('nr', 'integer', (col) => col.unsigned().notNull()),

    rps_choices: (builder) =>
        builder
            .addColumn('rps_round_id', 'integer', (col) =>
                col.notNull().references('rps_rounds.id').onDelete('cascade'),
            )
            .addColumn('user_id', 'varchar(255)', (col) => col.notNull())
            .addColumn('choice', 'varchar(255)', (col) => col.notNull()),
});
