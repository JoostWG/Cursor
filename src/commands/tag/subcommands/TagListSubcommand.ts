import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { TagSubcommand } from './TagSubcommand';

export class TagListSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'list',
            description: 'List of tags',
        };
    }

    protected override async handle({ interaction }: ChatInputContext<'cached'>): Promise<void> {
        const tags = await this.tags.list(interaction.guildId);

        await interaction.reply(
            `Tags:\n${tags.map((tag) => `${tag.name}: ${tag.content}`).join('\n')}`,
        );
    }
}
