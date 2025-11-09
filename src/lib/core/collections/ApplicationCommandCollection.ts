import type { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import type { BaseApplicationCommand } from '../command';
import { NamedObjectCollection } from './NamedObjectCollection';

export class ApplicationCommandCollection extends NamedObjectCollection<BaseApplicationCommand> {
    public getFromInteraction(
        interaction: CommandInteraction | AutocompleteInteraction,
    ): BaseApplicationCommand | null {
        return this.get(interaction.commandName) ?? null;
    }
}
