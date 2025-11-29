import { MessageFlags, type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord.js';
import { MessageContextMenu } from '../../../lib/core';
import type { MessageContextMenuContext } from '../../../lib/core/context';
import { jsonAttachment, type OmitType } from '../../../lib/utils';

export class RawCommand extends MessageContextMenu {
    protected override definition(): OmitType<RESTPostAPIContextMenuApplicationCommandsJSONBody> {
        return {
            name: 'Get raw message JSON',
        };
    }

    protected override async handle({ interaction }: MessageContextMenuContext): Promise<void> {
        await interaction.reply({
            flags: MessageFlags.Ephemeral,
            files: [jsonAttachment(interaction.targetMessage.toJSON(), 'message.json')],
        });
    }
}
