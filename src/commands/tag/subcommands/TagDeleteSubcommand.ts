import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { TagSubcommand } from './TagSubcommand';

export class TagDeleteSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'delete',
            description: 'Delete a tag',
            options: [
                this.nameOption(),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext<'cached'>): Promise<void> {
        const tag = await this.findTagOrFail(interaction);

        await this.tags.delete(tag.id);

        await interaction.reply('Tag deleted!');
    }
}
