import { ApplicationCommandType, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import type { OmitType } from '../../utils';
import type { UserContextMenuContext } from '../context';
import { ContextMenu } from './ContextMenu';

export abstract class UserContextMenu extends ContextMenu {
    protected constructor(data: OmitType<RESTPostAPIApplicationCommandsJSONBody>) {
        super({
            type: ApplicationCommandType.User,
            ...data,
        });
    }

    public abstract override execute(ctx: UserContextMenuContext): Promise<void>;
}
