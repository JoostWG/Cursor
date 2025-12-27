import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';
import type { BaseContext } from '../context';

export interface Invokable<TContext extends BaseContext> {
    invoke(ctx: TContext): Promise<void>;
    invokeAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
