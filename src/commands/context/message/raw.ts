import { MessageContextMenu } from '@/lib/core';
import { AttachmentBuilder, MessageContextMenuCommandInteraction, MessageFlags } from 'discord.js';

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
