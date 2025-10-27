import { container, mediaGallery, textDisplay } from '@/lib/utils/builders';
import type { Chess } from 'chess.js';
import {
    AttachmentBuilder,
    HeadingLevel,
    MessageFlags,
    heading,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from 'discord.js';
import type { MessageFactory, OutputHandler } from './types';

export class InteractionHandler implements OutputHandler {
    public constructor(
        private readonly interaction: ChatInputCommandInteraction,
        private readonly messageFactory: MessageFactory,
    ) {}

    public async initiate(chess: Chess, boardImageData: Buffer): Promise<void> {
        await this.interaction.reply(await this.buildMessage(chess, boardImageData));
    }

    public async update(chess: Chess, boardImageData: Buffer): Promise<void> {
        await this.interaction.editReply(await this.buildMessage(chess, boardImageData));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    private async buildMessage(chess: Chess, boardImageData: Buffer) {
        const file = new AttachmentBuilder(boardImageData, { name: 'board.png' });

        return {
            flags: MessageFlags.IsComponentsV2,
            files: [file],
            components: [
                container({
                    components: [
                        textDisplay({
                            content: heading(
                                this.messageFactory.getMessage(chess),
                                HeadingLevel.Three,
                            ),
                        }),
                        mediaGallery({
                            items: [{ media: { url: `attachment://${file.name}` } }],
                        }),
                        textDisplay({
                            content: chess.fen(),
                        }),
                    ],
                }),
            ],
        } satisfies InteractionReplyOptions;
    }
}
