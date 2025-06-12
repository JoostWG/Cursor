import {
    AttachmentBuilder,
    type MessageContextMenuCommandInteraction,
    MessageFlags,
} from 'discord.js';
import { MessageContextMenu } from '../../../core/command';

export default class RawCommand extends MessageContextMenu {
    public constructor() {
        super('Get raw message JSON');
    }

    public override async execute(interaction: MessageContextMenuCommandInteraction) {
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
