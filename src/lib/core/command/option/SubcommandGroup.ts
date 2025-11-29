import type {
    APIApplicationCommandSubcommandGroupOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
} from 'discord.js';
import type { OmitType } from '../../../utils';
import { subcommandGroup } from '../../../utils/builders';
import { SubcommandCollection } from '../../collections';
import type { ChatInputContext } from '../../context';
import type { HasName, Invokable } from '../../contracts';

export type SubcommandGroupDefinition = OmitType<APIApplicationCommandSubcommandGroupOption>;

export abstract class SubcommandGroup implements HasName, Invokable<ChatInputContext> {
    public get name(): string {
        return this.getData().name;
    }

    public async invoke(context: ChatInputContext): Promise<void> {
        const subcommand = this.subcommands().getFromInteraction(context.interaction);

        if (subcommand) {
            await subcommand.invoke(context);
        }

        await this.handle(context);
    }

    public async invokeAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!this.autocomplete) {
            return [];
        }

        return await this.autocomplete(interaction);
    }

    public getData(): APIApplicationCommandSubcommandGroupOption {
        const data = subcommandGroup(this.definition());

        data.options = [
            ...this.subcommands().map((subcommand) => subcommand.getData()),
            ...data.options ?? [],
        ];

        return data;
    }

    protected subcommands(): SubcommandCollection {
        return new SubcommandCollection();
    }

    protected abstract definition(): SubcommandGroupDefinition;
    protected abstract handle(context: ChatInputContext): Promise<void>;

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
