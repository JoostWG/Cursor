import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandUserOption,
    TimestampStyles,
    time,
} from 'discord.js';
import i18next from 'i18next';
import { SlashCommand } from '../core/command';
import type { Context } from '../core/context';
import { localize } from '../utils';

export default class UserCommand extends SlashCommand {
    public constructor() {
        super('user');

        this.data.addUserOption(localize(SlashCommandUserOption, 'user', 'user.options.user'));
    }

    public override async execute({ interaction }: Context<ChatInputCommandInteraction>) {
        const user = interaction.options.getUser('user') ?? interaction.user;

        const builder = new EmbedBuilder()
            .setAuthor({
                name: user.username,
                iconURL: user.avatarURL({ extension: 'png', size: 1024 }) ?? undefined,
            })
            .addFields({
                name: i18next.t('commands:user.createdAt', { lng: interaction.locale }),
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
