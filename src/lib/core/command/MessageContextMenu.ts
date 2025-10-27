import type { OmitType } from '@/lib/utils';
import {
    ApplicationCommandType,
    MessageContextMenuCommandInteraction,
    type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { ContextMenu } from './ContextMenu';

export abstract class MessageContextMenu extends ContextMenu {
    protected constructor(data: OmitType<RESTPostAPIApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.Message,
            ...data,
        });
    }

    public abstract override handle(
        interaction: MessageContextMenuCommandInteraction,
    ): Promise<void>;
}
