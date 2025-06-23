import {
    HeadingLevel,
    MessageFlags,
    bold,
    heading,
    inlineCode,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type Snowflake,
} from 'discord.js';
import type { Selectable } from 'kysely';
import { CommandError, GuildSlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import type { CursorDatabase } from '../setup';
import type { TagsTable } from '../types/database';
import { container, stringOption, subcommand, textDisplay } from '../utils/builders';

type TagData = Selectable<TagsTable>;

abstract class TagManager {
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
    public abstract update(
        tagId: number,
        data: {
            name?: string;
            content?: string;
            uses?: number;
        },
    ): Promise<void>;
    public abstract delete(tagId: number): Promise<void>;
}

class TagNotFoundError extends CommandError {
    public override name: string;

    public constructor(name: string) {
        super('Tag not found!');
        this.name = name;
    }
}

class DatabaseTagManager implements TagManager {
    public constructor(private readonly db: CursorDatabase) {}

    public async list(guildId: Snowflake) {
        return await this.db
            .selectFrom('tags')
            .where('guild_id', '=', guildId)
            .selectAll()
            .execute();
    }

    public async find(guildId: Snowflake, name: string): Promise<TagData | null>;
    public async find(guildId: Snowflake, name: string, options: { fail?: true }): Promise<TagData>;
    public async find(guildId: Snowflake, name: string, options?: { fail?: true }) {
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
    }) {
        const result = await this.db
            .insertInto('tags')
            .values({ guild_id: guildId, user_id: userId, name, content })
            .executeTakeFirstOrThrow();

        if (!result.insertId) {
            throw new Error('Failed to creaet tags');
        }

        return await this.db
            .selectFrom('tags')
            .where('id', '=', Number(result.insertId))
            .selectAll()
            .executeTakeFirstOrThrow();
    }

    public async update(
        tagId: number,
        data: {
            name?: string;
            content?: string;
            uses?: number;
        },
    ) {
        await this.db.updateTable('tags').where('id', '=', tagId).set(data).execute();
    }

    public async delete(tagId: number) {
        await this.db.deleteFrom('tags').where('id', '=', tagId).execute();
    }
}

export class TagCommand extends GuildSlashCommand {
    public constructor(private readonly tags: TagManager) {
        super({
            name: 'tag',
            description: 'Manage tags',
            options: [
                subcommand({
                    name: 'list',
                    description: 'List of tags',
                }),
                subcommand({
                    name: 'get',
                    description: 'Get single tag',
                    options: [
                        stringOption({
                            name: 'name',
                            description: 'tag name',
                            required: true,
                            autocomplete: true,
                        }),
                    ],
                }),
                subcommand({
                    name: 'info',
                    description: 'tag info',
                    options: [
                        stringOption({
                            name: 'name',
                            description: 'tag name',
                            required: true,
                            autocomplete: true,
                        }),
                    ],
                }),
                subcommand({
                    name: 'create',
                    description: 'Create a tag',
                    options: [
                        stringOption({
                            name: 'name',
                            description: 'tag name',
                            required: true,
                        }),
                        stringOption({
                            name: 'content',
                            description: 'The tag content',
                            required: true,
                            autocomplete: true,
                        }),
                    ],
                }),
                subcommand({
                    name: 'update',
                    description: 'Update a tag',
                    options: [
                        stringOption({
                            name: 'name',
                            description: 'tag name',
                            required: true,
                            autocomplete: true,
                        }),
                        stringOption({
                            name: 'content',
                            description: 'The tag content',
                            required: true,
                            autocomplete: true,
                        }),
                    ],
                }),
                subcommand({
                    name: 'delete',
                    description: 'Delete a tag',
                    options: [
                        stringOption({
                            name: 'name',
                            description: 'tag name',
                            required: true,
                            autocomplete: true,
                        }),
                    ],
                }),
            ],
        });
    }

    public static create({ db }: { db: CursorDatabase }) {
        return new this(new DatabaseTagManager(db));
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!interaction.guildId) {
            return [];
        }

        const tags = await this.tags.list(interaction.guildId);

        const q = interaction.options.getFocused().toLowerCase();

        return tags
            .toSorted((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q))
            .map((tag) => ({ name: tag.name, value: tag.name }));
    }

    public override async execute({ interaction }: ChatInputContext) {
        if (!interaction.inCachedGuild()) {
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case 'list':
                await this.handleListSubcommand(interaction);
                break;

            case 'get':
                await this.handleGetSubcommand(interaction);
                break;

            case 'info':
                await this.handleInfoSubcommand(interaction);
                break;

            case 'create':
                await this.handleCreateSubcommand(interaction);
                break;

            case 'update':
                await this.handleUpdateSubcommand(interaction);
                break;

            case 'delete':
                await this.handleDeleteSubcommand(interaction);
                break;

            default:
                await interaction.reply({
                    content: `No corresponding subcommand handler found for ${
                        inlineCode(interaction.options.getSubcommand())
                    }.`,
                    flags: MessageFlags.Ephemeral,
                });
                break;
        }
    }

    private async handleListSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tags = await this.tags.list(interaction.guildId);
        await interaction.reply(
            `Tags:\n${tags.map((tag) => `${tag.name}: ${tag.content}`).join('\n')}`,
        );
    }

    private async handleGetSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.tags.find(
            interaction.guildId,
            interaction.options.getString('name', true),
            { fail: true },
        );

        await this.tags.update(tag.id, {
            uses: tag.uses + 1,
        });

        await interaction.reply(tag.content);
    }

    private async handleInfoSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTagOrFail(interaction);

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                container({
                    components: [
                        textDisplay({
                            content: [
                                heading('Tag info', HeadingLevel.Three),
                                bold('Name'),
                                tag.name,
                                '',
                                bold('Created at'),
                                String(tag.created_at),
                                // time(tag.created_at),
                                // time(tag.created_at, TimestampStyles.RelativeTime),
                                '',
                                bold('Uses'),
                                tag.uses,
                            ].join('\n'),
                        }),
                    ],
                }),
            ],
        });
    }

    private async handleCreateSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const name = interaction.options.getString('name', true);
        const content = interaction.options.getString('content', true);

        const existingTag = await this.tags.find(interaction.guildId, name);

        if (existingTag) {
            throw new CommandError('A tag with that name already exists.');
        }

        await this.tags.create({
            name,
            content,
            guildId: interaction.guildId,
            userId: interaction.user.id,
        });

        await interaction.reply('Tag created!');
    }

    private async handleUpdateSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.update(tag.id, {
            content: interaction.options.getString('content', true),
        });

        await interaction.reply('Tag updated!');
    }

    private async handleDeleteSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.delete(tag.id);

        await interaction.reply('Tag deleted!');
    }

    private async findTagOrFail(interaction: ChatInputCommandInteraction<'cached'>) {
        return await this.tags.find(
            interaction.guildId,
            interaction.options.getString('name', true),
            { fail: true },
        );
    }
}
