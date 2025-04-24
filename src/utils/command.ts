import { getTranslations } from '.';
import {
    ApplicationCommandOptionBase,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export abstract class BaseCommand {
    private name: string;
    public devOnly?: boolean;
    public readonly data = new SlashCommandBuilder();

    public constructor(name: string, description: string) {
        this.name = name;
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

    protected wrapOption<T extends ApplicationCommandOptionBase>(
        option: T,
        name: string,
        description: string,
    ) {
        return option
            .setName(name)
            .setDescription(description)
            .setNameLocalizations(getTranslations(`commands.${this.name}.options.${name}.name`))
            .setDescriptionLocalizations(
                getTranslations(`commands.${this.name}.options.${name}.description`),
            );
    }
}
