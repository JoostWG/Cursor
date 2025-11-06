import type {
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import type { OmitType } from '../../../utils';
import { subcommand } from '../../../utils/builders';

export type SubcommandDefinition = OmitType<APIApplicationCommandSubcommandOption>;

export abstract class Subcommand {
    public async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
        await this.handle(interaction);
    }

    public async invokeAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!this.autocomplete) {
            return [];
        }

        return await this.autocomplete(interaction);
    }

    public getData(): APIApplicationCommandSubcommandOption {
        return subcommand(this.definition());
    }

    protected abstract definition(): SubcommandDefinition;
    protected abstract handle(interaction: ChatInputCommandInteraction): Promise<void>;

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
