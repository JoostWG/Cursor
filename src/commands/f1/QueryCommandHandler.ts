import { AttachmentBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { Api, Pagination, SimpleApiOptions, StatusType } from 'jolpica-f1-api';
import { OptionName, SubcommandName } from './F1CommandOptionsBuilder';

export class QueryCommandHandler {
    public constructor(private readonly api: Api) {
        //
    }

    public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand(true) as SubcommandName;

        const options: SimpleApiOptions = {
            season: interaction.options.getString(OptionName.Season) ?? undefined,
            round: interaction.options.getInteger(OptionName.Round) ?? undefined,
            circuit: interaction.options.getString(OptionName.Circuit) ?? undefined,
            driver: interaction.options.getString(OptionName.Driver) ?? undefined,
            fastestRank: interaction.options.getInteger(OptionName.Fastest) ?? undefined,
            gridPosition: interaction.options.getInteger(OptionName.Grid) ?? undefined,
            lap: interaction.options.getInteger(OptionName.Lap) ?? undefined,
            pitStopNumber: interaction.options.getInteger(OptionName.PitStop) ?? undefined,
            finishPosition: interaction.options.getInteger(OptionName.Result) ?? undefined,
            status: interaction.options.getString(OptionName.Status) as StatusType | null
                ?? undefined,
            team: interaction.options.getString(OptionName.Team) ?? undefined,
        };

        const pagination: Pagination = {
            limit: interaction.options.getInteger(OptionName.Limit) ?? undefined,
            offset: interaction.options.getInteger(OptionName.Offset) ?? undefined,
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
            files: [
                new AttachmentBuilder(
                    Buffer.from(JSON.stringify(response, null, '  '), 'utf-8'),
                    { name: `${subcommand}.json` },
                ),
            ],
        });
    }
}
