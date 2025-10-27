import type {
    APIButtonComponentWithCustomId,
    APISelectMenuComponent,
    CommandInteraction,
    InteractionCallbackResponse,
    InteractionCollector,
    MappedInteractionTypes,
    MessageCollectorOptionsParams,
    MessageComponentInteraction,
    MessageComponentType,
} from 'discord.js';

type ListenableComponent = APIButtonComponentWithCustomId | APISelectMenuComponent;

type Listener<T extends MessageComponentType = MessageComponentType> = (
    interaction: MappedInteractionTypes[T],
) => Promise<void>;

export abstract class ComponentUI {
    protected collector!: InteractionCollector<MappedInteractionTypes[MessageComponentType]>;
    private readonly listeners: Map<string, Listener>;

    protected constructor(
        protected readonly interaction: CommandInteraction,
        private readonly collectorOptions: Omit<
            MessageCollectorOptionsParams<MessageComponentType>,
            'componentType' | 'filter'
        > = {},
    ) {
        this.listeners = new Map();
    }

    public async start(): Promise<void> {
        const response = await this.sendInitialMessage(this.interaction);

        if (!response.resource?.message) {
            throw new Error('Missing response.resource?.message');
        }

        this.collector = response.resource.message.createMessageComponentCollector({
            filter: (i) => this.filter(i),
            ...this.collectorOptions,
        }).on(
            'collect',
            async (componentInteraction) => {
                if (this.listeners.has(componentInteraction.customId)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    await this.listeners.get(componentInteraction.customId)!(componentInteraction);
                }

                if (this.after) {
                    await this.after(componentInteraction);
                }
            },
        ).on('end', async () => {
            if (this.onEnd) {
                await this.onEnd();
            }
        });
    }

    protected filter(interaction: MessageComponentInteraction): boolean {
        return interaction.user.id === this.interaction.user.id;
    }

    protected listen<C extends ListenableComponent>(
        component: C,
        listener: Listener<C['type']>,
    ): C {
        this.listeners.set(component.custom_id, listener);

        return component;
    }

    protected abstract sendInitialMessage(
        interaction: CommandInteraction,
    ): Promise<InteractionCallbackResponse>;
    protected abstract after?(interaction: MessageComponentInteraction): Promise<void>;
    protected abstract onEnd?(): Promise<void>;
}
