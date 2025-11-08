import type {
    APIApplicationCommandSubcommandGroupOption,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from 'discord.js';
import type { OmitType } from '../../../utils';
import { subcommandGroup } from '../../../utils/builders';
import type { Subcommand } from './Subcommand';

export type SubcommandGroupDefinition = OmitType<APIApplicationCommandSubcommandGroupOption>;

export abstract class SubcommandGroup {
    public async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
        if (this.subcommands) {
            const subcommandName = interaction.options.getSubcommand();

            if (subcommandName) {
                const subcommand = this.getSubcommand(subcommandName);

                if (subcommand) {
                    await subcommand.invoke(interaction);
                    return;
                }
            }
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

        if (this.subcommands) {
            data.options = [
                ...this.subcommands().map(subcommand => subcommand.getData()),
                ...data.options ?? [],
            ];
        }

        return data;
    }

    protected getSubcommand(name: string): Subcommand | null {
        if (!this.subcommands) {
            return null;
        }

        for (const subcommand of this.subcommands()) {
            if (subcommand.getData().name === name) {
                return subcommand;
            }
        }

        return null;
    }

    protected abstract definition(): SubcommandGroupDefinition;
    protected abstract handle(interaction: ChatInputCommandInteraction): Promise<void>;

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;

    protected subcommands?(): Subcommand[];
}
