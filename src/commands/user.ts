import { TimestampStyles, time } from 'discord.js';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import { userOption } from '../utils/command-options';

export default class UserCommand extends SlashCommand {
    public constructor() {
        super({
            name: 'user',
            description: 'Get info on a user',
            options: [
                userOption({
                    name: 'user',
                    description: 'Select a user',
                }),
            ],
        });
    }

    public override async execute({ interaction }: ChatInputContext) {
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
