import {
    ApplicationCommandType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class SlashCommand extends BaseApplicationCommand<
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    ChatInputCommandInteraction
> {
    public override getData(): RESTPostAPIChatInputApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        return {
            type: ApplicationCommandType.ChatInput,
            ...this.definition(),
        };
    }

    public async invokeAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
        if (!this.autocomplete) {
            return [];
        }

        return await this.autocomplete(interaction);
    }

    protected autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
