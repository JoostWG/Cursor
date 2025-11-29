import type {
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
} from 'discord.js';
import type { OmitType } from '../../../utils';
import { subcommand } from '../../../utils/builders';
import type { ChatInputContext } from '../../context';
import type { HasName, Invokable } from '../../contracts';

export type SubcommandDefinition = OmitType<APIApplicationCommandSubcommandOption>;

export abstract class Subcommand implements HasName, Invokable<ChatInputContext> {
    public get name(): string {
        return this.getData().name;
    }

    public async invoke(ctx: ChatInputContext): Promise<void> {
        await this.handle(ctx);
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
    protected abstract handle(ctx: ChatInputContext): Promise<void>;

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
