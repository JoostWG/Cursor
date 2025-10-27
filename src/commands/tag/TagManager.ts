import type { Snowflake } from 'discord.js';
import type { TagData } from './types';

export abstract class TagManager {
    public abstract list(guildId: Snowflake): Promise<TagData[]>;
    public abstract find(guildId: Snowflake, name: string): Promise<TagData | null>;
    public abstract find(
        guildId: Snowflake,
        name: string,
        options: { fail?: true },
    ): Promise<TagData>;

    public abstract create(data: {
        guildId: Snowflake;
        userId: Snowflake;
        name: string;
        content: string;
    }): Promise<TagData>;

    public abstract update(tagId: number, data: {
        name?: string;
        content?: string;
        uses?: number;
    }): Promise<void>;

    public abstract delete(tagId: number): Promise<void>;
}
