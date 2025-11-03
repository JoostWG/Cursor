import {
    AttachmentBuilder,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommand } from '../../lib/core';
import {
    SimpleApi,
    type Pagination,
    type SimpleApiOptions,
    type StatusType,
} from '../../modules/f1-api';
import { AutocompleteHandler } from './AutocompleteHandler';
import { F1CommandOptionsBuilder, OptionName, SubcommandName } from './F1CommandOptionsBuilder';
import { FileApiCache } from './FileApiCache';

export class F1Command extends SlashCommand {
    private readonly optionsBuilder: F1CommandOptionsBuilder;
    private readonly api: SimpleApi;
    private readonly autocompleteHandler: AutocompleteHandler;

    public constructor() {
        const optionsBuilder = new F1CommandOptionsBuilder();

        super({
            name: 'f1',
            description: 'Formula 1',
            options: optionsBuilder.getOptions(),
        });

        this.optionsBuilder = optionsBuilder;

        this.devOnly = true;

        this.api = new SimpleApi(new FileApiCache('./cache/f1'));
        this.autocompleteHandler = new AutocompleteHandler(this.api);
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        return await this.autocompleteHandler.handle(interaction);
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
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

        const response = await ({
            [SubcommandName.Circuits]: async () => await this.api.getCircuits(options, pagination),
            [SubcommandName.DriverStandings]: async () =>
                // @ts-expect-error Ensured via required command option
                await this.api.getDriverStandings(options, pagination),
            [SubcommandName.Drivers]: async () => await this.api.getDrivers(options, pagination),
            // @ts-expect-error Ensured via required command option
            [SubcommandName.Laps]: async () => await this.api.getLaps(options, pagination),
            // @ts-expect-error Ensured via required command option
            [SubcommandName.PitStops]: async () => await this.api.getPitStops(options, pagination),
            [SubcommandName.QualifyingResults]: async () =>
                await this.api.getQualifyingResults(options, pagination),
            [SubcommandName.Races]: async () => await this.api.getRaces(options, pagination),
            [SubcommandName.Results]: async () => await this.api.getResults(options, pagination),
            [SubcommandName.Seasons]: async () => await this.api.getSeasons(options, pagination),
            [SubcommandName.SprintResults]: async () =>
                await this.api.getSprintResults(options, pagination),
            [SubcommandName.TeamStandings]: async () =>
                // @ts-expect-error Ensured via required command option
                await this.api.getTeamStandings(options, pagination),
            [SubcommandName.Teams]: async () => await this.api.getTeams(options, pagination),
        })[subcommand]();

        await interaction.reply({
            files: [
                new AttachmentBuilder(
                    Buffer.from(
                        JSON.stringify(
                            {
                                meta: response.meta,
                                data: response.data.map(structure => structure.toJson()),
                            },
                            null,
                            '  ',
                        ),
                        'utf-8',
                    ),
                    { name: `${subcommand}.json` },
                ),
            ],
        });
    }
}
