import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { attachment } from '../../../lib/utils';
import { stringOption } from '../../../lib/utils/builders';
import { Table } from '../../../lib/utils/table';
import { F1Subcommand } from './F1Subcommand';

export class WinsSubcommand extends F1Subcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'wins',
            description: "Get a driver's wins",
            options: [
                stringOption({
                    name: 'driver',
                    description: 'The driver',
                    required: true,
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const driverId = interaction.options.getString('driver', true);

        const { data: races } = await this.api
            .races({ driver: driverId, finishPosition: 1 })
            .get({ limit: 100 });

        const table = Table.build(races, [
            this.col('Season', (race) => race.season, true),
            this.col('Race', (race) => race.name),
            this.col('Circuit', ({ circuit }) => circuit.name),
            this.col('Location', ({ circuit: { location } }) => location.locality),
            this.col('Country', ({ circuit: { location } }) => location.country),
        ]);

        await interaction.reply({ files: [attachment(table.render(), 'results.txt')] });
    }
}
