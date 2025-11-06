import { Events, type Interaction } from 'discord.js';
import type { CommandCollection } from '../CommandCollection';
import { eventListener } from '../event-listener';

export class AutocompleteListener extends eventListener(Events.InteractionCreate) {
    public constructor(private readonly commands: CommandCollection) {
        super();
    }

    public override async handle(interaction: Interaction): Promise<void> {
        if (!interaction.isAutocomplete()) {
            return;
        }

        const command = this.commands.get(interaction.commandName);

        if (!command?.isSlashCommand()) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            const results = await command.invokeAutocomplete(interaction);
            await interaction.respond(results.slice(0, 25));
        } catch (error) {
            console.error(error);
        }
    }
}
