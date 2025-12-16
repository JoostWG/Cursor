import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { Result } from 'jolpica-f1-api';
import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { attachment, autocompleteResults } from '../../../lib/utils';
import { integerOption } from '../../../lib/utils/builders';
import { Table } from '../../../lib/utils/table';
import { F1Subcommand } from './F1Subcommand';

export class ResultsSubcommand extends F1Subcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'results',
            description: 'Results',
            options: [
                integerOption({
                    name: 'season',
                    description: 'Season',
                    autocomplete: true,
                }),
                integerOption({
                    name: 'round',
                    description: 'Round',
                    autocomplete: true,
                }),
            ],
        };
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

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const seasonInput = interaction.options.getInteger('season');
        const roundInput = interaction.options.getInteger('round');

        if (seasonInput !== null && !this.validateSeason(seasonInput)) {
            throw new CommandError('Invalid season');
        }

        const season = seasonInput ?? 'current';
        const round = roundInput ?? 'last';

        const { data: races } = await this.api.races({ season, round }).get();

        if (races.length === 0) {
            throw new CommandError('Race not found');
        }

        const [race] = races;

        const results = await this.api
            .results({ season, round })
            .get({ limit: 100 })
            .then(({ data }) => data)
            .catch(() => {
                throw new CommandError('Race not found');
            });

        const table = Table.build(results, [
            this.col('P', (result) => result.positionText, true),
            this.col('Nr', (result) => result.number, true),
            this.col('Driver', (result) => `${result.driver.firstName} ${result.driver.lastName}`),
            this.col('Constructor', (result) => result.team?.name ?? ''),
            this.col('Laps', (result) => result.laps ?? '', true),
            this.col(
                'Time/Status',
                (result) => result.finishingTime?.time ?? result.status ?? '-',
                true,
            ),
            this.col(
                'Fastest',
                (result) => result.fastestLap !== null ? result.fastestLap.time.time : '',
                true,
            ),
            this.col('Points', (result) => result.points !== 0 ? result.points : '', true),
            this.col('Grid', (result) => result.grid ?? '', true),
            this.col(
                '+/-',
                (result) =>
                    result.grid !== null && result.finishingTime !== null
                        ? this.formatPositionDiff(result.grid - Number(result.position))
                        : '',
                true,
            ),
            this.col(
                '+/-',
                (result) =>
                    result.grid !== null && result.finishingTime !== null
                        ? this.formatPositionDiff(this.getRealDiff(results, result))
                        : '',
                true,
            ),
        ]);

        const text = `${race.season} ${race.name}\n${table.render()}`;

        await interaction.reply({ files: [attachment(text, 'results.txt')] });
    }

    private formatPositionDiff(diff: number): string {
        return `${['-', '=', '+'][Math.sign(diff) + 1]} ${Math.abs(diff).toString().padStart(2)}`;
    }

    private getRealDiff(allResults: Result[], result: Result): number {
        return Number(result.grid) - Number(result.position) - allResults.filter(
            (r) => Number(r.grid) < Number(result.grid) && r.finishingTime === null,
        ).length;
    }
}
