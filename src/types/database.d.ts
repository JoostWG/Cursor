import type { ApplicationCommandType, CommandInteractionOption } from 'discord.js';
import type {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
} from 'kysely';

export interface Database {
    migrations: MigrationsTable;
    tags: TagsTable;
    rps_games: RpsGamesTable;
    rps_game_user: RpsGameUserTable;
    rps_rounds: RpsRoundsTable;
    rps_choices: RpsChoicesTable;
    command_logs: CommandLogsTable;
}

export interface MigrationsTable {
    id: Generated<number>;
    name: string;
    batch: number;
}

export interface BaseTable {
    id: Generated<number>;
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface TagsTable extends BaseTable {
    guild_id: string;
    user_id: string;
    name: string;
    content: string;
    uses: Generated<number>;
}

export interface RpsGamesTable extends BaseTable {
    user_id: string;
}

export interface RpsGameUserTable extends BaseTable {
    rps_game_id: number;
    user_id: string;
}

export interface RpsRoundsTable extends BaseTable {
    rps_game_id: number;
    nr: number;
}

export interface RpsChoicesTable extends BaseTable {
    rps_round_id: number;
    user_id: string;
    choice: 'rock' | 'paper' | 'scissors';
}

export interface CommandLogsTable extends BaseTable {
    interaction_id: string;
    user_id: string;
    channel_id: string;
    guild_id: string | null;
    command_type: ApplicationCommandType;
    command_name: string;
    options: JSONColumnType<CommandInteractionOption>;
}

export type TagRow = Selectable<TagsTable>;
export type NewTag = Insertable<TagsTable>;
export type TagUpdate = Updateable<TagsTable>;

export type RpsGameRow = Selectable<RpsGamesTable>;
export type NewRpsGame = Insertable<RpsGamesTable>;
export type RpsGameUpdate = Updateable<RpsGamesTable>;

export type RpsGameUserRow = Selectable<RpsGameUserTable>;
export type NewRpsGameUser = Insertable<RpsGameUserTable>;
export type RpsGameUserUpdate = Updateable<RpsGameUserTable>;

export type RpsRoundRow = Selectable<RpsRoundsTable>;
export type NewRpsRound = Insertable<RpsRoundsTable>;
export type RpsRoundUpdate = Updateable<RpsRoundsTable>;

export type RpsChoiceRow = Selectable<RpsChoicesTable>;
export type NewRpsChoice = Insertable<RpsChoicesTable>;
export type RpsChoiceUpdate = Updateable<RpsChoicesTable>;
