import { getTranslations, localize } from '.';
import {
    ApplicationCommandOptionBase,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
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
