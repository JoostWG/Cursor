import type {
    APIApplicationCommandIntegerOption,
    APIApplicationCommandStringOption,
    APIApplicationCommandSubcommandOption,
} from 'discord.js';
import { integerOption, stringOption, subcommand } from '../../lib/utils/builders';

export class F1CommandOptionsBuilder {
    public getOptions(): APIApplicationCommandSubcommandOption[] {
        return [
            this.getCircuitsSubcommand(),
            this.getDriverStandingsSubcommand(),
            this.getDriversSubcommand(),
            this.getLapsSubcommand(),
            this.getPitStopsSubcommand(),
            this.getQualifyingResultsSubcommand(),
            this.getRacesSubcommand(),
            this.getResultsSubcommand(),
            this.getSeasonsSubcommand(),
            this.getSprintsSubcommand(),
            this.getTeamStandingsSubcommand(),
            this.getTeamsSubcommand(),
        ];
    }

    // Subcommands

    private getCircuitsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'circuits',
            description: 'Query circuits',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getDriverOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getResultOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getDriverStandingsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'driver-standings',
            description: 'Query driver standings',
            options: [
                this.getSeasonOption(true),
                this.getRoundOption(),
                this.getDriverOption(),
            ],
        });
    }

    private getDriversSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'drivers',
            description: 'Query drivers',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getResultOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getLapsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'laps',
            description: 'Query laps',
            options: [
                this.getSeasonOption(true),
                this.getRoundOption(true),
                this.getDriverOption(),
                this.getLapOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getPitStopsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'pit-stops',
            description: 'Query pit stops',
            options: [
                this.getSeasonOption(true),
                this.getRoundOption(true),
                this.getDriverOption(),
                this.getLapOption(),
                this.getPitStopOption(),
            ],
        });
    }

    private getQualifyingResultsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'qualifying-results',
            description: 'Query qualifying results',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getFastestOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getRacesSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'races',
            description: 'Query races',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getResultsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'results',
            description: 'Query results',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getSeasonsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'seasons',
            description: 'Query seasons',
            options: [
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getSprintsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'sprints',
            description: 'Query sprints',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getTeamStandingsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'team-standings',
            description: 'Query team standings',
            options: [
                this.getSeasonOption(true),
                this.getRoundOption(),
                this.getTeamOption(),
            ],
        });
    }

    private getTeamsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'teams',
            description: 'Query teams',
            options: [
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getResultOption(),
                this.getStatusOption(),
            ],
        });
    }

    // Options

    private getSeasonOption(required = false): APIApplicationCommandStringOption {
        return stringOption({
            name: 'season',
            description: 'Filter on season',
            required,
        });
    }

    private getRoundOption(required = false): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'round',
            description: 'Filter on round',
            required,
        });
    }

    private getCircuitOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: 'circuit',
            description: 'Filter on circuit',
            required: false,
        });
    }

    private getDriverOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: 'driver',
            description: 'Filter on driver',
            required: false,
            autocomplete: true,
        });
    }

    private getFastestOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'fastest',
            description: 'Filter on fastest lap rank',
            required: false,
        });
    }

    private getGridOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'grid',
            description: 'Filter on grid position',
            required: false,
        });
    }

    private getLapOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'lap',
            description: 'Filter on lap number',
            required: false,
        });
    }

    private getPitStopOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'pit-stop',
            description: 'Filter on pit stop number',
            required: false,
        });
    }

    private getResultOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'result',
            description: 'Filter on finishing position',
            required: false,
        });
    }

    private getStatusOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: 'status',
            description: 'Filter on status',
            required: false,
        });
    }

    private getTeamOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: 'team',
            description: 'Filter on team',
            required: false,
        });
    }
}
