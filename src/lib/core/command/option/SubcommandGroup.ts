import type {
    APIApplicationCommandSubcommandGroupOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import type { OmitType } from '../../../utils';
import { subcommandGroup } from '../../../utils/builders';
import { SubcommandCollection } from '../../collections';
import type { HasName } from '../../contracts';

export type SubcommandGroupDefinition = OmitType<APIApplicationCommandSubcommandGroupOption>;

export abstract class SubcommandGroup implements HasName {
    public get name(): string {
        return this.getData().name;
    }

    public async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = this.subcommands().getFromInteraction(interaction);

        if (subcommand) {
            await subcommand.invoke(interaction);
        }

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
    protected abstract handle(interaction: ChatInputCommandInteraction): Promise<void>;

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
