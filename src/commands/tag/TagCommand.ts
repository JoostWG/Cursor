import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import type { CursorDatabase } from '../../database';
import { GuildSlashCommand } from '../../lib/core';
import { SubcommandCollection } from '../../lib/core/collections';
import type { OmitType } from '../../lib/utils';
import { DatabaseTagManager } from './DatabaseTagManager';
import {
    TagCreateSubcommand,
    TagDeleteSubcommand,
    TagGetSubcommand,
    TagInfoSubcommand,
    TagListSubcommand,
    TagUpdateSubcommand,
} from './subcommands';
import type { TagManager } from './TagManager';

export class TagCommand extends GuildSlashCommand {
    private readonly tags: TagManager;

    public constructor(db: CursorDatabase) {
        super();

        this.tags = new DatabaseTagManager(db);
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'tag',
            description: 'Manage tags',
        };
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new TagListSubcommand(this.tags),
            new TagGetSubcommand(this.tags),
            new TagInfoSubcommand(this.tags),
            new TagCreateSubcommand(this.tags),
            new TagUpdateSubcommand(this.tags),
            new TagDeleteSubcommand(this.tags),
        );
    }
}
