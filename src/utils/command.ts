import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { localize } from '.';

export class CommandError extends Error {
    //
}

export abstract class BaseCommand {
    public devOnly?: boolean;
    public readonly data = new SlashCommandBuilder();

    public constructor(name: string) {
        this.data = localize(SlashCommandBuilder, name, name);
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
