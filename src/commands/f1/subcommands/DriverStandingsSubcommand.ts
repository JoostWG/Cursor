import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { attachment } from '../../../lib/utils';
import { integerOption } from '../../../lib/utils/builders';
import { Table } from '../../../lib/utils/table';
import { F1Subcommand } from './F1Subcommand';

export class DriverStandingsSubcommand extends F1Subcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'driver-standings',
            description: 'Driver standings',
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

        const driverStandings = await this.api
            .getDriverStandings({ season, round }, { limit: 100 })
            .then(({ data }) => data)
            .catch(() => {
                throw new CommandError('Race not found');
            });

        const table = Table.build(driverStandings, [
            this.col('P', (entry) => entry.positionText, true),
            this.col('Driver', (entry) => `${entry.driver.firstName} ${entry.driver.lastName}`),
            this.col('Constructors', (entry) => entry.teams.map((team) => team.name).join(', ')),
            this.col('Wins', (entry) => entry.wins, true),
            this.col('Points', (entry) => entry.points, true),
        ]);

        const text = `${race.season} ${race.name}\n${table.render()}`;

        await interaction.reply({ files: [attachment(text, 'standings.txt')] });
    }
}
