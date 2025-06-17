import { EmbedBuilder, TimestampStyles, time } from 'discord.js';
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

        const builder = new EmbedBuilder()
            .setAuthor({
                name: user.username,
                iconURL: user.avatarURL({ extension: 'png', size: 1024 }) ?? undefined,
            })
            .addFields({
                name: 'Created at',
                value: [
                    time(user.createdAt),
                    time(user.createdAt, TimestampStyles.RelativeTime),
                ].join('\n'),
            });

        if (user.accentColor) {
            builder.setColor(user.accentColor);
        }

        await interaction.reply({ embeds: [builder] });
    }
}
