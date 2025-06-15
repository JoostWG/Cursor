import { Events, type Interaction } from 'discord.js';
import type { CommandCollection } from '../command-collection';
import { eventListener } from '../event-listener';

export class AutocompleteListener extends eventListener(Events.InteractionCreate) {
    public constructor(private readonly commands: CommandCollection) {
        super();
    }

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
