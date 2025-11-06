import type { ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { stringOption } from '../../../lib/utils/builders';
import { TagSubcommand } from './TagSubcommand';

export class TagUpdateSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
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
        };
    }

    protected override async handle(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.update(tag.id, {
            content: interaction.options.getString('content', true),
        });

        await interaction.reply('Tag updated!');
    }
}
