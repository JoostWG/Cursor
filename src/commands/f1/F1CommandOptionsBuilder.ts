import type {
    APIApplicationCommandBasicOption,
    APIApplicationCommandIntegerOption,
    APIApplicationCommandStringOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandSubcommandOption,
} from 'discord.js';
import { integerOption, stringOption, subcommand, subcommandGroup } from '../../lib/utils/builders';

export enum SubcommandName {
    Circuits = 'circuits',
    DriverStandings = 'driver-standings',
    Drivers = 'drivers',
    Laps = 'laps',
    PitStops = 'pit-stops',
    QualifyingResults = 'qualifying-results',
    Races = 'races',
    Results = 'results',
    Seasons = 'seasons',
    SprintResults = 'sprint-results',
    TeamStandings = 'team-standings',
    Teams = 'teams',
}

export enum OptionName {
    Season = 'season',
    Round = 'round',
    Circuit = 'circuit',
    Driver = 'driver',
    Fastest = 'fastest',
    Grid = 'grid',
    Lap = 'lap',
    PitStop = 'pit-stop',
    Result = 'result',
    Status = 'status',
    Team = 'team',
    Limit = 'limit',
    Offset = 'offset',
}

export class F1CommandOptionsBuilder {
    public getQuerySubcommandGroup(): APIApplicationCommandSubcommandGroupOption {
        return subcommandGroup({
            name: 'query',
            description: 'Query the Jolpica F1 API',
            options: [
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
            ],
        });
    }

    // Subcommands

    private getCircuitsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Circuits,
            description: 'Query circuits',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getDriverOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getResultOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getDriverStandingsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.DriverStandings,
            description: 'Query driver standings',
            options: this.options(
                this.getSeasonOption(true),
                this.getRoundOption(),
                this.getDriverOption(),
            ),
        });
    }

    private getDriversSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Drivers,
            description: 'Query drivers',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getResultOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getLapsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Laps,
            description: 'Query laps',
            options: this.options(
                this.getSeasonOption(true),
                this.getRoundOption(true),
                this.getDriverOption(),
                this.getLapOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getPitStopsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.PitStops,
            description: 'Query pit stops',
            options: this.options(
                this.getSeasonOption(true),
                this.getRoundOption(true),
                this.getDriverOption(),
                this.getLapOption(),
                this.getPitStopOption(),
            ),
        });
    }

    private getQualifyingResultsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.QualifyingResults,
            description: 'Query qualifying results',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getFastestOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getRacesSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Races,
            description: 'Query races',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getResultOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getResultsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Results,
            description: 'Query results',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getSeasonsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Seasons,
            description: 'Query seasons',
            options: this.options(
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getSprintsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.SprintResults,
            description: 'Query sprints',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getGridOption(),
                this.getStatusOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getTeamStandingsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.TeamStandings,
            description: 'Query team standings',
            options: this.options(
                this.getSeasonOption(true),
                this.getRoundOption(),
                this.getTeamOption(),
            ),
        });
    }

    private getTeamsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: SubcommandName.Teams,
            description: 'Query teams',
            options: this.options(
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getCircuitOption(),
                this.getDriverOption(),
                this.getFastestOption(),
                this.getGridOption(),
                this.getResultOption(),
                this.getStatusOption(),
            ),
        });
    }

    // Options

    private getSeasonOption(required = false): APIApplicationCommandStringOption {
        return stringOption({
            name: OptionName.Season,
            description: 'Filter on season',
            required,
            autocomplete: true,
        });
    }

    private getRoundOption(required = false): APIApplicationCommandIntegerOption {
        return integerOption({
            name: OptionName.Round,
            description: 'Filter on round',
            required,
        });
    }

    private getCircuitOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: OptionName.Circuit,
            description: 'Filter on circuit',
            required: false,
        });
    }

    private getDriverOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: OptionName.Driver,
            description: 'Filter on driver',
            required: false,
            autocomplete: true,
        });
    }

    private getFastestOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: OptionName.Fastest,
            description: 'Filter on fastest lap rank',
            required: false,
        });
    }

    private getGridOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: OptionName.Grid,
            description: 'Filter on grid position',
            required: false,
        });
    }

    private getLapOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: OptionName.Lap,
            description: 'Filter on lap number',
            required: false,
        });
    }

    private getPitStopOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: OptionName.PitStop,
            description: 'Filter on pit stop number',
            required: false,
        });
    }

    private getResultOption(): APIApplicationCommandIntegerOption {
        return integerOption({
            name: OptionName.Result,
            description: 'Filter on finishing position',
            required: false,
        });
    }

    private getStatusOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: OptionName.Status,
            description: 'Filter on status',
            required: false,
        });
    }

    private getTeamOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: OptionName.Team,
            description: 'Filter on team',
            required: false,
        });
    }

    // Helpers

    private options(
        ...options: APIApplicationCommandBasicOption[]
    ): APIApplicationCommandBasicOption[] {
        return [
            ...options,
            integerOption({
                name: OptionName.Limit,
                description: 'Pagination limit',
                min_value: 0,
                required: false,
            }),
            integerOption({
                name: OptionName.Offset,
                description: 'Pagination offset',
                min_value: 0,
                required: false,
            }),
        ];
    }
}
