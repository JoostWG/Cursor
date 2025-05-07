import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
    tags: TagsTable;
}

export interface TagsTable {
    id: Generated<number>;
    guild_id: string;
    user_id: string;
    name: string;
    content: string;
    uses: Generated<number>;
    created_at: ColumnType<Date, string | undefined, never>;
}

export type TagRow = Selectable<TagsTable>;
export type NewTag = Insertable<TagsTable>;
export type TagUpdate = Updateable<TagsTable>;
