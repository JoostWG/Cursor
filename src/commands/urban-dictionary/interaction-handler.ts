import {
    MessageFlags,
    type ChatInputCommandInteraction,
    type MessageComponentInteraction,
} from 'discord.js';
import type { ComponentBuilder } from './component-builder';
import type { OutputOptions } from './types';

export class InteractionHandler {
    private active: boolean;

    public constructor(
        private readonly interaction: ChatInputCommandInteraction,
        private readonly componentBuilder: ComponentBuilder,
    ) {
        this.active = false;
    }

    public async initiate(options: OutputOptions): Promise<void> {
        this.active = true;

        const { definition, pagination } = options;

        if (!pagination.totalPages || !definition) {
            await this.interaction.reply({
                content: 'No definitions found',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const response = await this.interaction.reply({
            components: this.componentBuilder.build({
                active: this.active,
                ...options,
            }),
            flags: MessageFlags.IsComponentsV2,
            withResponse: true,
        });

        if (!response.resource?.message) {
            console.error('Error...');
            return;
        }

        const collector = response.resource.message
            .createMessageComponentCollector({
                time: 60_000,
                filter: (i) => i.user.id === this.interaction.user.id,
            })
            .on('collect', async (componentInteraction) => {
                collector.resetTimer();

                const newOptions = await this.handleComponentInteraction(
                    componentInteraction,
                    options,
                );

                if (!newOptions) {
                    await componentInteraction.reply({
                        flags: [MessageFlags.Ephemeral],
                        content: 'Something went wrong...',
                    });
                    return;
                }

                await componentInteraction.update({
                    components: this.componentBuilder.build({
                        active: this.active,
                        ...newOptions,
                    }),
                });
            })
            .on('end', async () => {
                this.active = false;
                await this.interaction.editReply({
                    components: this.componentBuilder.build({
                        active: this.active,
                        ...options,
                    }),
                });
            });
    }

    private async handleComponentInteraction(
        interaction: MessageComponentInteraction,
        { urbanDictionary }: OutputOptions,
    ): Promise<OutputOptions | undefined> {
        switch (interaction.customId) {
            case 'previous':
                return await urbanDictionary.previousPage();

            case 'next':
                return await urbanDictionary.nextPage();

            case 'select':
                if (!interaction.isStringSelectMenu()) {
                    break;
                }

                return await urbanDictionary.goToDefinition(interaction.values[0]);

            case 'back':
                return await urbanDictionary.goBack();
        }
    }
}
