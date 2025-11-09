import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandGroup } from '../command';
import { NamedObjectCollection } from './NamedObjectCollection';

export class SubcommandGroupCollection extends NamedObjectCollection<SubcommandGroup> {
    public getFromInteraction(
        interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    ): SubcommandGroup | null {
        try {
            const subcommandGroupName = interaction.options.getSubcommandGroup();

            if (!subcommandGroupName) {
                return null;
            }

            return this.get(subcommandGroupName) ?? null;
        } catch (error) {
            if (!(error instanceof TypeError)) {
                throw error;
            }

            return null;
        }
    }
}
