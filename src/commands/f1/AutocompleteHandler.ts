import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { Api } from '../../modules/f1-api';

export class AutocompleteHandler {
    public constructor(private readonly api: Api) {
        //
    }

    public async handle(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const { name } = interaction.options.getFocused(true);

        if (name === 'driver') {
            return await this.handleDriverAutocomplete(interaction);
        }

        return [];
    }

    private async handleDriverAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const season = interaction.options.getString('season');
        const round = interaction.options.getInteger('round');

        if (season === null) {
            return [];
        }

        const query = this.api.drivers().season(season);

        if (round !== null) {
            query.round(round);
        }

        const drivers = await query.get();
        const searchString = interaction.options.getFocused().toLowerCase();

        return drivers
            .filter((driver) => driver.name.toLowerCase().includes(searchString))
            .toSorted((a, b) =>
                a.name.toLowerCase().indexOf(searchString)
                - b.name.toLowerCase().indexOf(searchString)
            )
            .map((driver) => ({ name: driver.name, value: driver.id }));
    }
}
