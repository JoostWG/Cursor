import type { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandError } from './ApplicationCommandError';

export class CommandHandlerNotFoundError extends ApplicationCommandError {
    public constructor(interaction: CommandInteraction | AutocompleteInteraction) {
        super(interaction, `Command '${interaction.commandName}' not found.`);
    }
}
