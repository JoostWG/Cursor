import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { F1Api } from 'f1-garage/jolpica';
import { autocompleteResults } from '../../../../lib/utils';
import { OptionName } from './QuerySubcommandGroupDefinitionBuilder';

export class AutocompleteHandler {
    public constructor(private readonly api: F1Api) {
        //
    }

    public async handle(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const { name } = interaction.options.getFocused(true) as { name: OptionName };

        if (name === OptionName.Driver) {
            return await this.handleDriverAutocomplete(interaction);
        }

        if (name === OptionName.Season) {
            return await this.handleSeasonAutocomplete(interaction);
        }

        return [];
    }

    private async handleSeasonAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const { data: seasons } = await this.api.seasons().get({ limit: 100 });

        return autocompleteResults(
            interaction.options.getFocused(),
            seasons,
            (season) => String(season.year),
            (season) => ({ name: String(season.year), value: String(season.year) }),
        );
    }

    private async handleDriverAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const season = interaction.options.getInteger(OptionName.Season);
        const round = interaction.options.getInteger(OptionName.Round);

        if (season === null) {
            return [];
        }

        const { data: drivers } = await this.api
            .drivers({ season, round: round ?? undefined })
            .get(
                { limit: 100 },
            );

        return autocompleteResults(
            interaction.options.getFocused(),
            drivers,
            (driver) => `${driver.firstName} ${driver.lastName}`,
            (driver) => ({
                name: `${driver.firstName} ${driver.lastName}`,
                value: driver.id,
            }),
        );
    }
}
