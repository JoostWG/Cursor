import {
    AttachmentBuilder,
    MessageFlags,
    type MessageContextMenuCommandInteraction,
} from 'discord.js';
import { MessageContextMenu } from '../../../lib/core';

export class RawCommand extends MessageContextMenu {
    public constructor() {
        super({
            name: 'Get raw message JSON',
        });
    }

    public override async handle(interaction: MessageContextMenuCommandInteraction): Promise<void> {
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
