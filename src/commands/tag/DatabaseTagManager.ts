import type { CursorDatabase } from '@/database';
import type { Snowflake } from 'discord.js';
import type { TagManager } from './TagManager';
import { TagNotFoundError } from './TagNotFoundError';
import type { TagData } from './types';

export class DatabaseTagManager implements TagManager {
    public constructor(private readonly db: CursorDatabase) {}

    public async list(guildId: Snowflake): Promise<TagData[]> {
        return await this.db
            .selectFrom('tags')
            .where('guild_id', '=', guildId)
            .selectAll()
            .execute();
    }

    public async find(guildId: Snowflake, name: string): Promise<TagData | null>;
    public async find(guildId: Snowflake, name: string, options: { fail?: true }): Promise<TagData>;
    public async find(
        guildId: Snowflake,
        name: string,
        options?: { fail?: true },
    ): Promise<TagData | null> {
        const query = this.db
            .selectFrom('tags')
            .where('guild_id', '=', guildId)
            .where('name', '=', name)
            .selectAll();

        return (
            (await (options?.fail
                ? query.executeTakeFirstOrThrow(() => new TagNotFoundError(name))
                : query.executeTakeFirst())) ?? null
        );
    }

    public async create({
        guildId,
        userId,
        name,
        content,
    }: {
        guildId: Snowflake;
        userId: Snowflake;
        name: string;
        content: string;
    }): Promise<TagData> {
        const result = await this.db
            .insertInto('tags')
            .values({ guild_id: guildId, user_id: userId, name, content })
            .executeTakeFirstOrThrow();

        if (!result.insertId) {
            throw new Error('Failed to create tags');
        }

        return await this.db
            .selectFrom('tags')
            .where('id', '=', Number(result.insertId))
            .selectAll()
            .executeTakeFirstOrThrow();
    }

    public async update(tagId: number, data: {
        name?: string;
        content?: string;
        uses?: number;
    }): Promise<void> {
        await this.db.updateTable('tags').where('id', '=', tagId).set(data).execute();
    }

    public async delete(tagId: number): Promise<void> {
        await this.db.deleteFrom('tags').where('id', '=', tagId).execute();
    }
}
