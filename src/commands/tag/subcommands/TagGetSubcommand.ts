import type { ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { stringOption } from '../../../lib/utils/builders';
import { TagSubcommand } from './TagSubcommand';

export class TagGetSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
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
        };
    }

    protected override async handle(
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
}
