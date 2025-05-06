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

    protected wrapOption<T extends ApplicationCommandOptionBase>(
        option: T,
        name: string,
        description: string,
        subcommand?: string,
    ) {
        const translationKeyPrefix = subcommand
            ? `commands:${this.name}.subcommands.${subcommand}.options.${name}`
            : `commands:${this.name}.options.${name}.name`;

        return option
            .setName(name)
            .setDescription(description)
            .setNameLocalizations(getTranslations(`${translationKeyPrefix}.name`))
            .setDescriptionLocalizations(getTranslations(`${translationKeyPrefix}.description`));
    }

    protected wrapSubcommand(
        subcommand: SlashCommandSubcommandBuilder,
        name: string,
        description: string,
    ) {
        return subcommand
            .setName(name)
            .setDescription(description)
            .setNameLocalizations(getTranslations(`commands:${this.name}.subcommands.${name}.name`))
            .setDescriptionLocalizations(
                getTranslations(`commands:${this.name}.subcommands.${name}.description`),
            );
    }
}
