import type { OmitType } from '@/lib/utils';
import {
    ApplicationCommandType,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type { ChatInputContext } from '../context';
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

    public abstract override execute(ctx: ChatInputContext): Promise<void>;

    public autocomplete?(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]>;
}
