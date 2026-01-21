import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { AnyApiOptions, F1Api, Pagination, StatusType } from 'f1-garage/jolpica';
import { SubcommandGroup, type SubcommandGroupDefinition } from '../../../../lib/core';
import type { ChatInputContext } from '../../../../lib/core/context';
import { jsonAttachment } from '../../../../lib/utils';
import { AutocompleteHandler } from './AutocompleteHandler';
import {
    OptionName,
    QuerySubcommandGroupDefinitionBuilder,
    SubcommandName,
} from './QuerySubcommandGroupDefinitionBuilder';

export class QuerySubcommandGroup extends SubcommandGroup {
    private readonly autocompleteHandler: AutocompleteHandler;

    public constructor(private readonly api: F1Api) {
        super();

        this.autocompleteHandler = new AutocompleteHandler(this.api);
    }

    protected override definition(): SubcommandGroupDefinition {
        return new QuerySubcommandGroupDefinitionBuilder().getQuerySubcommandGroup();
    }

    protected override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        return await this.autocompleteHandler.handle(interaction);
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const subcommand = interaction.options.getSubcommand(true) as SubcommandName;

        function string(name: OptionName): string | undefined {
            return interaction.options.getString(name) ?? undefined;
        }

        function integer(name: OptionName): number | undefined {
            return interaction.options.getInteger(name) ?? undefined;
        }

        const options: AnyApiOptions = {
            season: integer(OptionName.Season),
            round: integer(OptionName.Round),
            circuit: string(OptionName.Circuit),
            driver: string(OptionName.Driver),
            fastestRank: integer(OptionName.Fastest),
            gridPosition: integer(OptionName.Grid),
            lap: integer(OptionName.Lap),
            pitStopNumber: integer(OptionName.PitStop),
            finishPosition: integer(OptionName.Result),
            status: string(OptionName.Status) as StatusType | undefined,
            team: string(OptionName.Team),
        };

        const pagination: Pagination = {
            limit: integer(OptionName.Limit),
            offset: integer(OptionName.Offset),
        };

        const { api } = this;

        const request = ({
            [SubcommandName.Circuits]: api.circuits(options),
            // @ts-expect-error Safe at runtime
            [SubcommandName.DriverStandings]: api.driverStandings(options),
            [SubcommandName.Drivers]: api.drivers(options),
            // @ts-expect-error Safe at runtime
            [SubcommandName.Laps]: api.laps(options),
            // @ts-expect-error Safe at runtime
            [SubcommandName.PitStops]: api.pitStops(options),
            [SubcommandName.QualifyingResults]: api.qualifyingResults(options),
            [SubcommandName.Races]: api.races(options),
            [SubcommandName.Results]: api.results(options),
            [SubcommandName.Seasons]: api.seasons(options),
            [SubcommandName.SprintResults]: api.sprintResults(options),
            // @ts-expect-error Safe at runtime
            [SubcommandName.TeamStandings]: api.teamStandings(options),
            [SubcommandName.Teams]: api.teams(options),
        })[subcommand];

        const response = await request.get(pagination);

        await interaction.reply({
            files: [jsonAttachment(response, `${subcommand}.json`)],
        });
    }
}
