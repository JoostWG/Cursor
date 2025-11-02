import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { CommandError, SlashCommand } from '../../lib/core';
import { Api, type SuccessResponse, type UrlBuilder } from '../../modules/f1-api';
import { F1CommandOptionsBuilder } from './F1CommandOptionsBuilder';

export class F1Command extends SlashCommand {
    private readonly optionsBuilder: F1CommandOptionsBuilder;
    private readonly api: Api;

    public constructor() {
        const optionsBuilder = new F1CommandOptionsBuilder();

        super({
            name: 'f1',
            description: 'Formula 1',
            options: optionsBuilder.getOptions(),
        });

        this.optionsBuilder = optionsBuilder;

        this.devOnly = true;

        this.api = new Api();
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const results = await this.getQuery(interaction).get({ limit: 5 });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields({
                        name: 'Whatever',
                        value: results.map(x => String(x)).join('\n') || 'Nope',
                    }),
            ],
        });
    }

    private getQuery(
        interaction: ChatInputCommandInteraction,
    ): UrlBuilder<SuccessResponse, unknown[]> {
        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === 'circuits') {
            const query = this.api.circuits();

            const driverId = interaction.options.getString('driver');

            if (driverId) {
                query.driver(driverId);
            }

            return query;
        }

        throw new CommandError('Whoops!');
    }
}
