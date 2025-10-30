import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../lib/core';
import { Client } from '../modules/f1-api';

export class F1Command extends SlashCommand {
    private readonly f1: Client;

    public constructor() {
        super({
            name: 'f1',
            description: 'Formula 1',
        });

        this.devOnly = true;

        this.f1 = new Client();
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const driver = await this.f1.getDriver('hamilton');
        const circuits = await driver.getCircuits({ limit: 100 });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields({ name: 'Driver', value: driver.name })
                    .addFields({
                        name: 'Circuits',
                        value: circuits.map((circuit) => circuit.name).join('\n'),
                    }),
            ],
        });
    }
}
