import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { TagSubcommand } from './TagSubcommand';

export class TagGetSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'get',
            description: 'Get single tag',
            options: [
                this.nameOption(),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext<'cached'>): Promise<void> {
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
}
