import {
    TimestampStyles,
    time,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { SlashCommand } from '../lib/core';
import type { OmitType } from '../lib/utils';
import { userOption } from '../lib/utils/builders';

export class UserCommand extends SlashCommand {
    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'user',
            description: 'Get info on a user',
            options: [
                userOption({
                    name: 'user',
                    description: 'Select a user',
                }),
            ],
        };
    }

    protected override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const user = interaction.options.getUser('user') ?? interaction.user;

        await interaction.reply({
            embeds: [
                {
                    color: user.accentColor ?? undefined,
                    author: {
                        name: user.username,
                        icon_url: user.avatarURL({ extension: 'png', size: 1024 }) ?? undefined,
                    },
                    fields: [
                        {
                            name: 'Created at',
                            value: [
                                time(user.createdAt),
                                time(user.createdAt, TimestampStyles.RelativeTime),
                            ].join('\n'),
                        },
                    ],
                },
            ],
        });
    }
}
