import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { F1Api } from 'f1-garage/jolpica';
import _ from 'lodash';
import { Subcommand } from '../../../lib/core';
import { autocompleteResults, type Stringable } from '../../../lib/utils';
import type { Column } from '../../../lib/utils/table';

export abstract class F1Subcommand extends Subcommand {
    public constructor(protected readonly api: F1Api) {
        super();
    }

    protected col<T>(
        name: string,
        value: (result: T) => Stringable,
        alignRight = false,
    ): Column<T> {
        return { name, value, options: { align: alignRight ? 'right' : 'left' } };
    }

    protected override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const focused = interaction.options.getFocused(true);

        if (focused.name === 'season') {
            return autocompleteResults(
                focused.value,
                this.getValidSeasons(),
                (year) => year.toString(),
                (year) => ({ name: year.toString(), value: year.toString() }),
            );
        }

        const season = interaction.options.getInteger('season');

        if (focused.name === 'round' && this.validateSeason(season)) {
            return await this.api.races({ season })
                .get()
                .then(({ data: races }) =>
                    autocompleteResults(
                        focused.value,
                        races,
                        (race) => race.name,
                        (race) => ({ name: race.name, value: race.round.toString() }),
                    )
                )
                .catch(() => []);
        }

        return [];
    }

    protected getValidSeasons(): number[] {
        return _.range(1950, new Date().getFullYear() + 1);
    }

    protected validateSeason(season: unknown): season is number {
        return typeof season === 'number'
            && season >= 1950
            && season <= (new Date().getFullYear());
    }
}
