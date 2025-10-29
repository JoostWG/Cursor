import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommand } from '../../lib/core';
import { stringOption } from '../../lib/utils/builders';
import type { Api } from '../../modules/urban-dictionary';
import { CachedApi } from './CachedApi';
import { ComponentBuilder } from './ComponentBuilder';
import { InteractionHandler } from './InteractionHandler';
import { UrbanDictionary } from './UrbanDictionary';

export class UrbanDictionaryCommand extends SlashCommand {
    private readonly api: Api;

    public constructor() {
        super({
            name: 'urban-dictionary',
            description: 'Urban dictionary',
            nsfw: true,
            options: [
                stringOption({
                    name: 'term',
                    description: 'The term to search for',
                    required: true,
                    autocomplete: true,
                }),
            ],
        });

        this.api = new CachedApi();
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await new UrbanDictionary(
            this.api,
            new InteractionHandler(interaction, new ComponentBuilder()),
        ).start(interaction.options.getString('term', true));
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const term = interaction.options.getFocused();

        if (!term) {
            return [];
        }

        const results = await this.api.autocomplete(term);

        return results.map((result) => ({ name: result, value: result }));
    }
}
