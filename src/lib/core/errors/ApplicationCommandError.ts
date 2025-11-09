import type { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { CoreError } from './CoreError';

export class ApplicationCommandError extends CoreError {
    public constructor(
        public readonly interaction: CommandInteraction | AutocompleteInteraction,
        message?: string,
        cause?: unknown,
    ) {
        super(message, { cause });
    }
}
