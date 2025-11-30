import {
    ApplicationCommandType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { SubcommandCollection, SubcommandGroupCollection } from '../collections';
import type { ChatInputContext } from '../context';
import type { Invokable } from '../contracts';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class SlashCommand extends BaseApplicationCommand<
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    ChatInputContext
> {
    public override getData(): RESTPostAPIChatInputApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        const data = {
            type: ApplicationCommandType.ChatInput as const,
            ...this.definition(),
        };

        data.options = [
            ...this.subcommandGroups().map((subcommandGroup) => subcommandGroup.getData()),
            ...this.subcommands().map((subcommand) => subcommand.getData()),
            ...data.options ?? [],
        ];

        return data;
    }

    public async invokeAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        const invokable = this.getInvokable(interaction);

        if (invokable) {
            return await invokable.invokeAutocomplete(interaction);
        }

        if (!this.autocomplete) {
            return [];
        }

        return await this.autocomplete(interaction);
    }

    public override async invoke(ctx: ChatInputContext): Promise<void> {
        const invokable = this.getInvokable(ctx.interaction);

        if (invokable) {
            await invokable.invoke(ctx);

            return;
        }

        await super.invoke(ctx);
    }

    protected subcommandGroups(): SubcommandGroupCollection {
        return new SubcommandGroupCollection();
    }

    protected subcommands(): SubcommandCollection {
        return new SubcommandCollection();
    }

    private getInvokable(
        interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    ): Invokable<ChatInputContext> | null {
        const subcommandGroup = this.subcommandGroups().getFromInteraction(interaction);

        if (subcommandGroup) {
            return subcommandGroup;
        }

        const subcommand = this.subcommands().getFromInteraction(interaction);

        if (subcommand) {
            return subcommand;
        }

        return null;
    }

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
