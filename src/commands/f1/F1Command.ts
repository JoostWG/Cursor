import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { CommandError, SlashCommand } from '../../lib/core';
import { stringTitle } from '../../lib/utils';
import { Api, type SuccessResponse, type UrlBuilder } from '../../modules/f1-api';
import { AutocompleteHandler } from './AutocompleteHandler';
import { F1CommandOptionsBuilder } from './F1CommandOptionsBuilder';
import { FileApiCache } from './FileApiCache';

export class F1Command extends SlashCommand {
    private readonly optionsBuilder: F1CommandOptionsBuilder;
    private readonly api: Api;
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

        this.api = new Api(new FileApiCache('./cache/f1'));
        this.autocompleteHandler = new AutocompleteHandler(this.api);
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        return await this.autocompleteHandler.handle(interaction);
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const results = await this.getUrlBuilderFromInteraction(interaction).get();

        await interaction.reply({
            embeds: [
                {
                    title: stringTitle(interaction.options.getSubcommand(true)),
                    description: results.map(x => String(x)).join('\n'),
                },
            ],
        });
    }

    private getUrlBuilderFromInteraction(
        interaction: ChatInputCommandInteraction,
    ): UrlBuilder<SuccessResponse, unknown[]> {
        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === 'circuits') {
            const query = this.api.circuits();

            const year = interaction.options.getString('season');
            const round = interaction.options.getInteger('round');
            const driverId = interaction.options.getString('driver');

            if (year) {
                query.season(year);
            }

            if (round) {
                query.round(round);
            }

            if (driverId) {
                query.driver(driverId);
            }

            return query;
        }

        throw new CommandError('Whoops!');
    }
}
