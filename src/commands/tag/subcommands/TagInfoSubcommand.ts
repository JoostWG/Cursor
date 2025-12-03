import { HeadingLevel, MessageFlags, bold, heading } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { container, textDisplay } from '../../../lib/utils/builders';
import { TagSubcommand } from './TagSubcommand';

export class TagInfoSubcommand extends TagSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'info',
            description: 'tag info',
            options: [
                this.nameOption(),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext<'cached'>): Promise<void> {
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
