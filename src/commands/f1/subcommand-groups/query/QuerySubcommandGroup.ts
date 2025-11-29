import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { Api, Pagination, SimpleApiOptions, StatusType } from 'jolpica-f1-api';
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

    public constructor(private readonly api: Api) {
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

        // I hate JavaScript
        const { getString, getInteger } = {
            getString: interaction.options.getString.bind(interaction.options),
            getInteger: interaction.options.getInteger.bind(interaction.options),
        };

        const options: SimpleApiOptions = {
            season: interaction.options.getString('season') ?? undefined,
            round: getInteger(OptionName.Round) ?? undefined,
            circuit: getString(OptionName.Circuit) ?? undefined,
            driver: getString(OptionName.Driver) ?? undefined,
            fastestRank: getInteger(OptionName.Fastest) ?? undefined,
            gridPosition: getInteger(OptionName.Grid) ?? undefined,
            lap: getInteger(OptionName.Lap) ?? undefined,
            pitStopNumber: getInteger(OptionName.PitStop) ?? undefined,
            finishPosition: getInteger(OptionName.Result) ?? undefined,
            status: getString(OptionName.Status) as StatusType | null ?? undefined,
            team: getString(OptionName.Team) ?? undefined,
        };

        const pagination: Pagination = {
            limit: getInteger(OptionName.Limit) ?? undefined,
            offset: getInteger(OptionName.Offset) ?? undefined,
        };

        const { api } = this;

        const callback = ({
            [SubcommandName.Circuits]: api.getCircuits.bind(api),
            [SubcommandName.DriverStandings]: api.getDriverStandings.bind(api),
            [SubcommandName.Drivers]: api.getDrivers.bind(api),
            [SubcommandName.Laps]: api.getLaps.bind(api),
            [SubcommandName.PitStops]: api.getPitStops.bind(api),
            [SubcommandName.QualifyingResults]: api.getQualifyingResults.bind(api),
            [SubcommandName.Races]: api.getRaces.bind(api),
            [SubcommandName.Results]: api.getResults.bind(api),
            [SubcommandName.Seasons]: api.getSeasons.bind(api),
            [SubcommandName.SprintResults]: api.getSprintResults.bind(api),
            [SubcommandName.TeamStandings]: api.getTeamStandings.bind(api),
            [SubcommandName.Teams]: api.getTeams.bind(api),
        })[subcommand];

        // @ts-expect-error This is safe at runtime by command definition
        const response = await callback(options, pagination);

        await interaction.reply({
            files: [jsonAttachment(response, `${subcommand}.json`)],
        });
    }
}
