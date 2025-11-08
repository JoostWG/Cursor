import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import type { Subcommand } from '../command';
import { NamedObjectCollection } from './NamedObjectCollection';

export class SubcommandCollection extends NamedObjectCollection<Subcommand> {
    public getFromInteraction(
        interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    ): Subcommand | null {
        try {
            const subcommandName = interaction.options.getSubcommand(false);

            if (!subcommandName) {
                return null;
            }

            return this.get(subcommandName) ?? null;
        } catch (error) {
            if (!(error instanceof TypeError)) {
                throw error;
            }

            return null;
        }
    }
}
