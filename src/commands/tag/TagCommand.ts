import type { CursorDatabase } from '@/database';
import { CommandError, GuildSlashCommand } from '@/lib/core';
import { container, stringOption, subcommand, textDisplay } from '@/lib/utils/builders';
import {
    HeadingLevel,
    MessageFlags,
    bold,
    heading,
    inlineCode,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
} from 'discord.js';
import { DatabaseTagManager } from './DatabaseTagManager';
import type { TagManager } from './TagManager';
import type { TagData } from './types';

export class TagCommand extends GuildSlashCommand {
    private readonly tags: TagManager;

    public constructor(db: CursorDatabase) {
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

        this.tags = new DatabaseTagManager(db);
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

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
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
                        inlineCode(
                            interaction.options.getSubcommand(),
                        )
                    }.`,
                    flags: MessageFlags.Ephemeral,
                });
                break;
        }
    }

    private async handleListSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const tags = await this.tags.list(interaction.guildId);
        await interaction.reply(
            `Tags:\n${tags.map((tag) => `${tag.name}: ${tag.content}`).join('\n')}`,
        );
    }

    private async handleGetSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
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

    private async handleInfoSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
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

    private async handleCreateSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
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

    private async handleUpdateSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.update(tag.id, {
            content: interaction.options.getString('content', true),
        });

        await interaction.reply('Tag updated!');
    }

    private async handleDeleteSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.delete(tag.id);

        await interaction.reply('Tag deleted!');
    }

    private async findTagOrFail(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<TagData> {
        return await this.tags.find(
            interaction.guildId,
            interaction.options.getString('name', true),
            { fail: true },
        );
    }
}
