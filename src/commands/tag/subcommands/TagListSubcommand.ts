import type { ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { TagSubcommand } from './TagSubcommand';

export class TagListSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'list',
            description: 'List of tags',
        };
    }

    protected override async handle(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const tags = await this.tags.list(interaction.guildId);

        await interaction.reply(
            `Tags:\n${tags.map((tag) => `${tag.name}: ${tag.content}`).join('\n')}`,
        );
    }
}
