import {
    AttachmentBuilder,
    MessageFlags,
    type MessageContextMenuCommandInteraction,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { MessageContextMenu } from '../../../lib/core';
import type { OmitType } from '../../../lib/utils';

export class RawCommand extends MessageContextMenu {
    protected override definition(): OmitType<RESTPostAPIContextMenuApplicationCommandsJSONBody> {
        return {
            name: 'Get raw message JSON',
        };
    }

    protected override async handle(
        interaction: MessageContextMenuCommandInteraction,
    ): Promise<void> {
        await interaction.reply({
            flags: MessageFlags.Ephemeral,
            files: [
                new AttachmentBuilder(
                    Buffer.from(
                        JSON.stringify(interaction.targetMessage.toJSON(), null, '  '),
                        'utf-8',
                    ),
                    { name: 'message.json' },
                ),
            ],
        });
    }
}
