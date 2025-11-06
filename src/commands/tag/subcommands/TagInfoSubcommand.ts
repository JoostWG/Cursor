import {
    HeadingLevel,
    MessageFlags,
    bold,
    heading,
    type ChatInputCommandInteraction,
} from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { container, stringOption, textDisplay } from '../../../lib/utils/builders';
import { TagSubcommand } from './TagSubcommand';

export class TagInfoSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
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
        };
    }

    protected override async handle(
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
}
