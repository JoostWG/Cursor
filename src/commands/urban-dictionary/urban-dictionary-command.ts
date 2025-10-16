import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import { SlashCommand } from '../../core/command';
import type { ChatInputContext } from '../../core/context';
import type { Api } from '../../modules/urban-dictionary';
import { stringOption } from '../../utils/builders';
import { CachedApi } from './cached-api';
import { ComponentBuilder } from './component-builder';
import { InteractionHandler } from './interaction-handler';
import { UrbanDictionary } from './urban-dictionary';

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

    public override async execute({ interaction }: ChatInputContext): Promise<void> {
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
