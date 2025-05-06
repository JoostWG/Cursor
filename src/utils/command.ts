import { localize } from '.';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export abstract class BaseCommand {
    private name: string;
    public devOnly?: boolean;
    public readonly data = new SlashCommandBuilder();

    public constructor(name: string) {
        this.name = name;

        this.data = localize(SlashCommandBuilder, name, name);
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
