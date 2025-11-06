import type { ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { TagSubcommand } from './TagSubcommand';

export class TagUpdateSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'update',
            description: 'Update a tag',
            options: [
                this.nameOption(),
                this.contentOption(),
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
