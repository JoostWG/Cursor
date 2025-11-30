import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { Api, Result } from 'jolpica-f1-api';
import _ from 'lodash';
import { CommandError } from '../../../CommandError';
import { Subcommand, type SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { attachment, searchSorted, type Stringable } from '../../../lib/utils';
import { integerOption } from '../../../lib/utils/builders';
import { Table, type Column } from '../../../lib/utils/table';

export class RecentResultsSubcommand extends Subcommand {
    public constructor(private readonly api: Api) {
        super();
    }

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
            return searchSorted(
                this.getValidSeasons(),
                focused.value,
                (year) => year.toString(),
            ).map((year) => ({ name: year.toString(), value: year.toString() }));
        }

        const season = interaction.options.getInteger('season');

        if (focused.name === 'round' && this.validateSeason(season)) {
            return await this.api.getRaces({ season: season.toString() })
                .then(({ data: races }) =>
                    searchSorted(
                        races,
                        focused.value,
                        (race) => race.name,
                    ).map((race) => ({ name: race.name, value: race.round.toString() }))
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

        const season = seasonInput?.toString() ?? 'current';
        const round = roundInput ?? 'last';

        const { data: races } = await this.api.getRaces({ season, round });

        if (races.length === 0) {
            throw new CommandError('Race not found');
        }

        const [race] = races;

        const results = await this.api
            .getResults({ season, round }, { limit: 100 })
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

    private col(
        name: string,
        value: (result: Result) => Stringable,
        alignRight = false,
    ): Column<Result> {
        return { name, value, options: { align: alignRight ? 'right' : 'left' } };
    }

    private formatPositionDiff(diff: number): string {
        return `${['-', '=', '+'][Math.sign(diff) + 1]} ${Math.abs(diff).toString().padStart(2)}`;
    }

    private getRealDiff(allResults: Result[], result: Result): number {
        return Number(result.grid) - Number(result.position) - allResults.filter(
            (r) => Number(r.grid) < Number(result.grid) && r.finishingTime === null,
        ).length;
    }

    private getValidSeasons(): number[] {
        return _.range(1950, new Date().getFullYear() + 1);
    }

    private validateSeason(season: unknown): season is number {
        return typeof season === 'number'
            && season >= 1950
            && season <= (new Date().getFullYear() + 1);
    }
}
