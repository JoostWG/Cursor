import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    CommandInteraction,
} from 'discord.js';

export interface Invokable<TInteraction extends CommandInteraction> {
    invoke: (interaction: TInteraction) => Promise<void>;
    invokeAutocomplete: (
        interaction: AutocompleteInteraction,
    ) => Promise<ApplicationCommandOptionChoiceData[]>;
}
