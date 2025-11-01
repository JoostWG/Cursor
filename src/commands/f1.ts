import {
    EmbedBuilder,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommand } from '../lib/core';
import { stringOption } from '../lib/utils/builders';
import { Api, type Season } from '../modules/f1-api';

export class F1Command extends SlashCommand {
    private readonly api: Api;
    private seasons?: Season[];

    public constructor() {
        super({
            name: 'f1',
            description: 'Formula 1',
            options: [
                stringOption({
                    name: 'season',
                    description: 'Season',
                    autocomplete: true,
                    required: true,
                }),
                stringOption({
                    name: 'driver',
                    description: 'Driver',
                    autocomplete: true,
                    required: true,
                }),
            ],
        });

        this.devOnly = true;

        this.api = new Api();

        void this.api
            .seasons()
            .get({ limit: 100 })
            .then((seasons) => {
                this.seasons = seasons;
            });
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'season') {
            if (!this.seasons) {
                return [];
            }

            return this.seasons
                .filter((season) => season.year.includes(focusedOption.value))
                .map((season) => ({ name: season.year, value: season.year }));
        }

        if (focusedOption.name === 'driver') {
            const season = interaction.options.getString('season');

            if (!season) {
                return [];
            }

            const drivers = await this.api.drivers().season(season).get({ limit: 100 });

            const q = focusedOption.value.toLowerCase();

            return drivers
                .filter((driver) => driver.name.toLowerCase().includes(q))
                .toSorted((a, b) =>
                    a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q)
                )
                .map((driver) => ({ name: driver.name, value: driver.id }));
        }

        return [];
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const circuits = await this.api.circuits()
            .season(interaction.options.getString('season', true))
            .driver(interaction.options.getString('driver', true))
            .result(1)
            .get();

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields({
                        name: 'Whatever',
                        value: circuits.map(circuit => String(circuit)).join('\n') || 'Nope',
                    }),
            ],
        });
    }
}
