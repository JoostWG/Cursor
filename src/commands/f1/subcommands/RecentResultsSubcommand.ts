import type { Api, Result } from 'jolpica-f1-api';
import { Subcommand, type SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { attachment, type Stringable } from '../../../lib/utils';
import { Table, type Column } from '../../../lib/utils/table';

export class RecentResultsSubcommand extends Subcommand {
    public constructor(private readonly api: Api) {
        super();
    }

    protected override definition(): SubcommandDefinition {
        return {
            name: 'recent-results',
            description: 'Recent results',
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const { data: results } = await this.api.getResults({ season: 'current', round: 'last' });

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
                // I don't know why it doesn't see that fastestLap can be null
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (result) => result.fastestLap !== null ? result.fastestLap.time.time : '',
                true,
            ),
            this.col('Points', (result) => result.points !== 0 ? result.points : '', true),
            this.col('Grid', (result) => result.grid ?? '', true),
            this.col(
                '+/-',
                (result) =>
                    result.grid !== null
                        ? this.formatPositionDiff(result.grid - Number(result.position) - 1)
                        : '',
                true,
            ),
            this.col(
                '+/-',
                (result) =>
                    result.grid !== null
                        ? this.formatPositionDiff(this.getRealDiff(results, result))
                        : '',
                true,
            ),
        ]);

        await interaction.reply({ files: [attachment(table.render(), 'results.txt')] });
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
}
