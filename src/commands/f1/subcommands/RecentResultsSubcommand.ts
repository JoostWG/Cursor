import type { Api } from 'jolpica-f1-api';
import { Subcommand, type SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { attachment } from '../../../lib/utils';
import { Table } from '../../../lib/utils/table';

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
        const table = new Table([
            Table.row([
                Table.cell('P', { align: 'right' }),
                Table.cell('Driver'),
                Table.cell('Constructor'),
                Table.cell('Time/Status', { align: 'right' }),
                Table.cell('Points', { align: 'right' }),
                Table.cell('Grid', { align: 'right' }),
                Table.cell('Diff', { align: 'right' }),
            ]),
            Table.divider(),
            ...results.map((result, index) =>
                Table.row([
                    Table.cell(result.positionText, { align: 'right' }),
                    Table.cell(`${result.driver.firstName} ${result.driver.lastName}`),
                    Table.cell(result.team?.name ?? ''),
                    Table.cell(result.finishingTime?.time ?? result.status ?? '-', {
                        align: 'right',
                    }),
                    Table.cell(result.points !== 0 ? result.points : '', { align: 'right' }),
                    Table.cell(result.grid ?? '', { align: 'right' }),
                    Table.cell(
                        result.grid !== null
                            ? this.formatPositionDiff(result.grid - index + 1)
                            : '',
                        { align: 'right' },
                    ),
                ])
            ),
        ]);

        await interaction.reply({ files: [attachment(table.render(), 'results.txt')] });
    }

    private formatPositionDiff(diff: number): string {
        return `${Math.abs(diff)} ${['-', '=', '+'][Math.sign(diff) + 1]}`;
    }
}
