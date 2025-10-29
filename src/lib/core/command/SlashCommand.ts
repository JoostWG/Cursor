import type { OmitType } from '@/lib/utils';
import {
    ApplicationCommandType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { BaseApplicationCommand } from './BaseApplicationCommand';

export abstract class SlashCommand
    extends BaseApplicationCommand<RESTPostAPIChatInputApplicationCommandsJSONBody>
{
    protected constructor(data: OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.ChatInput,
            ...data,
        });
    }

    public abstract override handle(interaction: ChatInputCommandInteraction): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
