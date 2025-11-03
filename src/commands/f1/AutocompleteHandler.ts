import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { SimpleApi } from '../../modules/f1-api';
import { OptionName } from './F1CommandOptionsBuilder';

export class AutocompleteHandler {
    public constructor(private readonly api: SimpleApi) {
        //
    }

    public async handle(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const { name } = interaction.options.getFocused(true) as { name: OptionName };

        if (name === OptionName.Driver) {
            return await this.handleDriverAutocomplete(interaction);
        }

        return [];
    }

    private async handleDriverAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const season = interaction.options.getString(OptionName.Season);
        const round = interaction.options.getInteger(OptionName.Round);

        if (season === null) {
            return [];
        }

        const { data: drivers } = await this.api.getDrivers({ season, round: round ?? undefined });

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
