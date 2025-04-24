import { getTranslations } from '.';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export abstract class BaseCommand {
    public devOnly?: boolean;
    public readonly data = new SlashCommandBuilder();

    public constructor(name: string, description: string) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description)
            .setNameLocalizations(getTranslations(`commands.${name}.name`))
            .setDescriptionLocalizations(getTranslations(`commands.${name}.description`));
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
