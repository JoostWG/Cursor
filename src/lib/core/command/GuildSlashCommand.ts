import {
    InteractionContextType,
    type ApplicationCommandType,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { SlashCommand } from './SlashCommand';

export abstract class GuildSlashCommand extends SlashCommand {
    public override getData(): RESTPostAPIChatInputApplicationCommandsJSONBody & {
        type: ApplicationCommandType;
    } {
        return {
            contexts: [InteractionContextType.Guild],
            ...super.getData(),
        };
    }
}
