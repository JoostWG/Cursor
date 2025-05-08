import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import {
    ContainerBuilder,
    HeadingLevel,
    InteractionContextType,
    MessageFlags,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    TextDisplayBuilder,
    bold,
    heading,
    inlineCode,
} from 'discord.js';
import { Tag } from '../database/models/Tag';
import { BaseCommand, CommandError } from '../utils/command';

class TagNotFoundError extends CommandError {
    public name: string;

    public constructor(name: string) {
        super('Tag not found!');
        this.name = name;
    }
}

export default class TagCommand extends BaseCommand {
    public constructor() {
        super('tag');

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

    public async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!interaction.guildId) {
            return [];
        }

        const tags = await Tag.select((query) => query.where('guild_id', '=', interaction.guildId));

        const q = interaction.options.getFocused().toLowerCase();

        return tags
            .toSorted((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q))
            .map((tag) => ({ name: tag.name, value: tag.name }));
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
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
        const tags = await Tag.select((query) => query.where('guild_id', '=', interaction.guildId));
        await interaction.reply(tags.map((tag) => `${tag.id}: ${tag.content}`).join('\n'));
    }

    private async handleGetSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTagOrFail(interaction);

        await tag.update({
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
                            String(tag.createdAt),
                            // time(tag.createdAt),
                            // time(tag.createdAt, TimestampStyles.RelativeTime),
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

        const existingTag = await this.findTag(interaction);

        if (existingTag) {
            throw new CommandError('A tag with that name already exists.');
        }

        await Tag.create({
            name,
            content,
            guild_id: interaction.guildId,
            user_id: interaction.user.id,
        });

        await interaction.reply('Tag created!');
    }

    private async handleUpdateSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTagOrFail(interaction);

        await tag.update({
            content: interaction.options.getString('content', true),
        });

        await interaction.reply('Tag updated!');
    }

    private async handleDeleteSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTagOrFail(interaction);

        await tag.delete();

        await interaction.reply('Tag deleted!');
    }

    private async findTag(interaction: ChatInputCommandInteraction<'cached'>) {
        return await Tag.selectOne((query) =>
            query
                .where('guild_id', '=', interaction.guildId)
                .where('name', '=', interaction.options.getString('name', true)),
        );
    }

    private async findTagOrFail(interaction: ChatInputCommandInteraction<'cached'>) {
        const tag = await this.findTag(interaction);

        if (!tag) {
            throw new TagNotFoundError(interaction.options.getString('name', true));
        }

        return tag;
    }
}
