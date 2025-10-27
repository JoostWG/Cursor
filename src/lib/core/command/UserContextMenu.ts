import type { OmitType } from '@/lib/utils';
import {
    ApplicationCommandType,
    type RESTPostAPIApplicationCommandsJSONBody,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { ContextMenu } from './ContextMenu';

export abstract class UserContextMenu extends ContextMenu {
    protected constructor(data: OmitType<RESTPostAPIApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.User,
            ...data,
        });
    }

    public abstract override handle(interaction: UserContextMenuCommandInteraction): Promise<void>;
}
