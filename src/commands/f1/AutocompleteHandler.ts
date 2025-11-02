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

        return this.filter(drivers, interaction.options.getFocused(), (driver) => driver.name)
            .map((driver) => ({ name: driver.name, value: driver.id }));
    }

    private filter<T>(entries: T[], search: string, toString: (entry: T) => string): T[] {
        const searchString = search.toLowerCase();
        // eslint-disable-next-line func-style
        const toStr = (entry: T): string => toString(entry).toLowerCase();

        return entries
            .filter((entry) => toStr(entry).includes(searchString))
            .toSorted((a, b) => toStr(a).indexOf(searchString) - toStr(b).indexOf(searchString));
    }
}
