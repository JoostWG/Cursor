import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { Api } from 'jolpica-f1-api';
import { CommandError, SlashCommand } from '../../lib/core';
import { AutocompleteHandler } from './AutocompleteHandler';
import { F1CommandOptionsBuilder } from './F1CommandOptionsBuilder';
import { FileApiCache } from './FileApiCache';
import { QueryCommandHandler } from './QueryCommandHandler';

export class F1Command extends SlashCommand {
    private readonly api: Api;
    private readonly autocompleteHandler: AutocompleteHandler;
    private readonly queryCommandHandler: QueryCommandHandler;

    public constructor() {
        super({
            name: 'f1',
            description: 'Formula 1',
            options: [
                new F1CommandOptionsBuilder().getQuerySubcommandGroup(),
            ],
        });

        this.devOnly = true;

        this.api = new Api(new FileApiCache('./cache/f1'));
        this.autocompleteHandler = new AutocompleteHandler(this.api);
        this.queryCommandHandler = new QueryCommandHandler(this.api);
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const subcommandGroup = interaction.options.getSubcommandGroup();

        if (subcommandGroup && subcommandGroup === 'query') {
            return await this.autocompleteHandler.handle(interaction);
        }

        return [];
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommandGroup = interaction.options.getSubcommandGroup();

        if (subcommandGroup && subcommandGroup === 'query') {
            await this.queryCommandHandler.handle(interaction);
            return;
        }

        throw new CommandError('No command handler found :(');
    }
}
