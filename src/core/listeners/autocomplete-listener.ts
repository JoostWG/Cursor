import { Events, type Interaction } from 'discord.js';
import type { CommandCollection } from '../command-collection';
import type { EventListener } from '../listener';

export class AutocompleteListener implements EventListener<Events.InteractionCreate> {
    public readonly event = Events.InteractionCreate;

    public constructor(private readonly commands: CommandCollection) {}

    public async execute(interaction: Interaction) {
        if (!interaction.isAutocomplete()) {
            return;
        }

        const command = this.commands.get(interaction.commandName);
        if (!command?.isSlashCommand() || !command.autocomplete) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            const results = await command.autocomplete(interaction);
            await interaction.respond(results.slice(0, 25));
        } catch (error) {
            console.error(error);
        }
    }
}
