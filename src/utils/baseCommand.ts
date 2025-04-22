import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SharedSlashCommand,
} from 'discord.js';

export default abstract class BaseCommand {
    public static readonly devOnly?: boolean;
    public static readonly data: SharedSlashCommand;

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
