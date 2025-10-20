import {
    InteractionContextType,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type { OmitType } from '../../utils';
import { SlashCommand } from './SlashCommand';

export abstract class GuildSlashCommand extends SlashCommand {
    protected constructor(
        data: Omit<OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody>, 'contexts'>,
    ) {
        super({ contexts: [InteractionContextType.Guild], ...data });
    }
}
