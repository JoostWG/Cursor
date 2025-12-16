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
            season: getInteger(OptionName.Season) ?? undefined,
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
