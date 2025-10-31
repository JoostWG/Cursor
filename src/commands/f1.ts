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
        const circuits = await this.f1.driver('max_verstappen').circuits().get({ limit: 100 });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields({
                        name: 'Circuits',
                        value: circuits.map((circuit) => circuit.name).join('\n'),
                    }),
            ],
        });
    }
}
