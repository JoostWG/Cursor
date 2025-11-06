import type { ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { stringOption } from '../../../lib/utils/builders';
import { TagSubcommand } from './TagSubcommand';

export class TagDeleteSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
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
        };
    }

    protected override async handle(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.delete(tag.id);

        await interaction.reply('Tag deleted!');
    }
}
