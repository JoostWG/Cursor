import {
    ApplicationCommandType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { BaseApplicationCommand } from './BaseApplicationCommand';
import type { Subcommand, SubcommandGroup } from './option';

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

        if (this.subcommandGroups) {
            data.options = [
                ...this.subcommandGroups().map(subcommandGroup => subcommandGroup.getData()),
                ...data.options ?? [],
            ];
        }

        if (this.subcommands) {
            data.options = [
                ...this.subcommands().map(subcommand => subcommand.getData()),
                ...data.options ?? [],
            ];
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
        if (this.subcommandGroups) {
            const subcommandGroupName = interaction.options.getSubcommandGroup();

            if (subcommandGroupName) {
                const subcommandGroup = this.getSubcommandGroup(subcommandGroupName);

                if (subcommandGroup) {
                    await subcommandGroup.invoke(interaction);
                    return;
                }
            }
        }

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

        await super.invoke(interaction);
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

    protected getSubcommandGroup(name: string): SubcommandGroup | null {
        if (!this.subcommandGroups) {
            return null;
        }

        for (const subcommandGroup of this.subcommandGroups()) {
            if (subcommandGroup.getData().name === name) {
                return subcommandGroup;
            }
        }

        return null;
    }

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;

    protected subcommandGroups?(): SubcommandGroup[];
    protected subcommands?(): Subcommand[];
}
