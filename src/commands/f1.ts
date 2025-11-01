import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../lib/core';
import { Api } from '../modules/f1-api';

export class F1Command extends SlashCommand {
    private readonly f1: Api;

    public constructor() {
        super({
            name: 'f1',
            description: 'Formula 1',
        });

        this.devOnly = true;

        this.f1 = new Api();
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const statuses = await this.f1.statuses().year('2020').get();

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields({
                        name: 'Whatever',
                        value: statuses.map((status) => status.name).join('\n'),
                    }),
            ],
        });
    }
}
