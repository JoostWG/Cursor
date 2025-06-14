import {
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    ContainerBuilder,
    HeadingLevel,
    InteractionContextType,
    MessageFlags,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    type Snowflake,
    TextDisplayBuilder,
    bold,
    heading,
    inlineCode,
} from 'discord.js';
import { CommandError, SlashCommand } from '../core/command';
import type { Context } from '../core/context';
import type { CursorDatabase } from '../setup';
import type { TagRow } from '../types/database';

abstract class TagManager {
    public abstract list(guildId: Snowflake): Promise<TagRow[]>;
    public abstract find(guildId: Snowflake, name: string): Promise<TagRow | null>;
    public abstract find(
        guildId: Snowflake,
        name: string,
        options: { fail?: true },
    ): Promise<TagRow>;
    public abstract create(data: {
        guildId: Snowflake;
        userId: Snowflake;
        name: string;
        content: string;
    }): Promise<TagRow>;
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
    public name: string;

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

    public async find(guildId: Snowflake, name: string): Promise<TagRow | null>;
    public async find(guildId: Snowflake, name: string, options: { fail?: true }): Promise<TagRow>;
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

export default class TagCommand extends SlashCommand {
    private readonly tags: TagManager;

    public constructor(db: CursorDatabase) {
        super('tag');

        this.tags = new DatabaseTagManager(db);

        this.data
            .setContexts(InteractionContextType.Guild)
            .addSubcommand(
                new SlashCommandSubcommandBuilder().setName('list').setDescription('List of tags'),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('get')
                    .setDescription('Get single tag')
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('name')
                            .setDescription('tag name')
                            .setRequired(true)
                            .setAutocomplete(true),
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('info')
                    .setDescription('tag info')
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('name')
                            .setDescription('tag name')
                            .setRequired(true)
                            .setAutocomplete(true),
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('create')
                    .setDescription('Create a tag')
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('name')
                            .setDescription('tag name')
                            .setRequired(true),
                    )
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('content')
                            .setDescription('The tag content')
                            .setRequired(true),
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('update')
                    .setDescription('Update a tag')
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('name')
                            .setDescription('tag name')
                            .setRequired(true)
                            .setAutocomplete(true),
                    )
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('content')
                            .setDescription('The tag content')
                            .setRequired(true),
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('delete')
                    .setDescription('Delete a tag')
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('name')
                            .setDescription('tag name')
                            .setRequired(true)
                            .setAutocomplete(true),
                    ),
            );
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

    public override async execute({ interaction }: Context<ChatInputCommandInteraction>) {
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
                    content: `No corresponding subcommand handler found for ${inlineCode(interaction.options.getSubcommand())}.`,
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
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        [
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
                    ),
                ),
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
