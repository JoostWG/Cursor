import type { ChatInputCommandInteraction } from 'discord.js';
import { CommandError, type SubcommandDefinition } from '../../../lib/core';
import { TagSubcommand } from './TagSubcommand';

export class TagCreateSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'create',
            description: 'Create a tag',
            options: [
                this.nameOption({ autocomplete: false }),
                this.contentOption(),
            ],
        };
    }

    protected override async handle(
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
}
