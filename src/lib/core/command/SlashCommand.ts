import {
    ApplicationCommandType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { BaseApplicationCommand } from './BaseApplicationCommand';
import type { Subcommand } from './option';

export abstract class SlashCommand extends BaseApplicationCommand<
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    ChatInputCommandInteraction
> {
    public override getData(): RESTPostAPIChatInputApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        const data = {
            type: ApplicationCommandType.ChatInput as const,
            ...this.definition(),
        };

        if (this.subcommands) {
            data.options = this.subcommands().map(subcommand => subcommand.getData());
        }

        return data;
    }

    public async invokeAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (this.subcommands) {
            const subcommandName = interaction.options.getSubcommand();

            if (subcommandName) {
                for (const subcommand of this.subcommands()) {
                    if (subcommand.getData().name === subcommandName) {
                        return await subcommand.invokeAutocomplete(interaction);
                    }
                }
            }
        }

        if (!this.autocomplete) {
            return [];
        }

        return await this.autocomplete(interaction);
    }

    public override async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
        if (this.subcommands) {
            const subcommandName = interaction.options.getSubcommand();

            if (subcommandName) {
                for (const subcommand of this.subcommands()) {
                    if (subcommand.getData().name === subcommandName) {
                        await subcommand.invoke(interaction);
                        return;
                    }
                }
            }
        }

        await super.invoke(interaction);
    }

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;

    protected subcommands?(): Subcommand[];
}
