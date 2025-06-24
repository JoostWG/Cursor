import axios from 'axios';
import {
    ButtonStyle,
    Collection,
    HeadingLevel,
    MessageFlags,
    heading,
    inlineCode,
    subtext,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type MessageComponentInteraction,
} from 'discord.js';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import {
    actionRow,
    button,
    container,
    separator,
    stringOption,
    stringSelect,
    textDisplay,
} from '../utils/builders';

interface Definition {
    defid: number;
    word: string;
    definition: string;
    author: string;
    written_on: string;
    example: string;
    permalink: string;
    thumbs_up: number;
    thumbs_down: number;
    current_vote: string;
}

type ResponseData<T> =
    | T
    | {
        error: string | number;
    };

interface Pagination {
    currentPage: number;
    totalPages: number;
}

interface OutputOptions {
    urbanDictionary: UrbanDictionary;
    definition: Definition | null;
    history: HistoryItem[];
    pagination: Pagination;
}

interface ComponentBuilderOptions extends OutputOptions {
    active: boolean;
}

abstract class Api {
    public abstract define(term: string): Promise<Definition[]>;
    public abstract autocomplete(term: string): Promise<string[]>;
}

class ApiError extends Error {
    //
}

class UrbanDictionaryApi implements Api {
    private readonly axios: axios.AxiosInstance;

    public constructor() {
        this.axios = axios.create({
            baseURL: 'https://api.urbandictionary.com/v0',
        });
    }

    public async define(term: string) {
        const data = await this.get<{ list: Definition[] }>('/define', { params: { term } });

        return data.list;
    }

    public async autocomplete(term: string) {
        return await this.get<string[]>('/autocomplete', { params: { term } });
    }

    private async get<T>(url: string, config?: axios.AxiosRequestConfig) {
        const { data } = await this.axios.get<ResponseData<T>>(url, config);

        // `data` can be anything
        if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'error' in data) {
            throw new ApiError(typeof data.error === 'number' ? data.error.toString() : data.error);
        }

        return data;
    }
}

class UrbanDictionaryCachedApi extends UrbanDictionaryApi {
    public constructor(
        private readonly definitionsCache: Collection<string, Promise<Definition[]>>,
        private readonly autocompleteCache: Collection<string, Promise<string[]>>,
    ) {
        super();
    }

    public override async define(term: string) {
        return await this.definitionsCache.ensure(term, async () => await super.define(term));
    }

    public override async autocomplete(term: string) {
        return await this.autocompleteCache.ensure(
            term,
            async () => await super.autocomplete(term),
        );
    }
}

class UrbanDictionaryComponentBuilder {
    private readonly hyperlinkRegex = /\[([^[\]]+)\]/gmu;

    public build({
        definition,
        history,
        pagination: { currentPage, totalPages },
        active,
    }: ComponentBuilderOptions) {
        if (!definition) {
            return [container({ components: [textDisplay({ content: 'Something went wrong!' })] })];
        }

        const hyperlinkTerms = [
            ...this.extractHyperlinks(definition.definition),
            ...this.extractHyperlinks(definition.example),
        ];

        return [
            container({
                components: [
                    textDisplay({
                        content: [
                            heading(definition.word),
                            subtext(`By ${definition.author}`),
                            this.transformHyperlinks(definition.definition),
                            heading('Example', HeadingLevel.Three),
                            this.transformHyperlinks(definition.example),
                        ].join('\n'),
                    }),
                    separator({ divider: true }),
                    textDisplay({
                        content: inlineCode(history.map((item) => item.term).join(' > ')),
                    }),
                    actionRow({
                        components: [
                            stringSelect({
                                placeholder: 'Select a term',
                                custom_id: 'select',
                                options: hyperlinkTerms.length
                                    ? hyperlinkTerms.map((term) => ({ label: term, value: term }))
                                    : [{ label: 'null', value: 'null' }],
                                disabled: !hyperlinkTerms.length || !active,
                            }),
                        ],
                    }),
                    actionRow({
                        components: [
                            button({
                                style: ButtonStyle.Danger,
                                label: 'Back',
                                custom_id: 'back',
                                disabled: history.length < 2 || !active,
                            }),
                        ],
                    }),
                    separator({ divider: true }),
                    actionRow({
                        components: [
                            button({
                                style: ButtonStyle.Primary,
                                label: 'Previous',
                                custom_id: 'previous',
                                disabled: currentPage <= 0 || !active,
                            }),
                            button({
                                style: ButtonStyle.Primary,
                                label: 'Next',
                                custom_id: 'next',
                                disabled: currentPage + 1 >= totalPages || !active,
                            }),
                            button({
                                style: ButtonStyle.Link,
                                label: 'Open in browser',
                                url: definition.permalink,
                            }),
                        ],
                    }),
                    textDisplay({
                        content: subtext(`${currentPage + 1}/${totalPages}`),
                    }),
                ],
            }),
        ];
    }

    private extractHyperlinks(text: string) {
        return text.matchAll(this.hyperlinkRegex).map((match) => match[1]);
    }

    private transformHyperlinks(text: string) {
        return text.replace(
            this.hyperlinkRegex,
            (_, term: string) => `[${term}](${this.getWebUrl(term)})`,
        );
    }

    private getWebUrl(term: string) {
        return `https://urbandictionary.com/define.php?term=${encodeURIComponent(term)}`;
    }
}

class InteractionHandler {
    private active: boolean;

    public constructor(
        private readonly interaction: ChatInputCommandInteraction,
        private readonly componentBuilder: UrbanDictionaryComponentBuilder,
    ) {
        this.active = false;
    }

    public async initiate(options: OutputOptions) {
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
    ) {
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

class HistoryItem {
    public readonly term: string;
    public readonly definitions: Definition[];
    public index: number;

    public constructor(term: string, definitions: Definition[]) {
        this.term = term;
        this.definitions = definitions;
        this.index = 0;
    }

    public getDefinition(): Definition | null {
        return this.definitions[this.index] ?? null;
    }
}

class UrbanDictionary {
    private readonly api: Api;
    private readonly interactionHandler: InteractionHandler;
    private readonly history: HistoryItem[];

    public constructor(api: Api, interactionHandler: InteractionHandler) {
        this.api = api;
        this.interactionHandler = interactionHandler;
        this.history = [];
    }

    public async start(term: string) {
        const item = await this.addHistoryItem(term);

        await this.interactionHandler.initiate({
            urbanDictionary: this,
            definition: item.getDefinition(),
            history: this.history,
            pagination: { currentPage: item.index, totalPages: item.definitions.length },
        });
    }

    public async goToDefinition(term: string) {
        await this.addHistoryItem(term);

        return this.getOptions();
    }

    public async goBack() {
        this.history.pop();

        return this.getOptions();
    }

    public async previousPage() {
        const item = this.history.at(-1);

        if (item) {
            item.index--;
        }

        return this.getOptions();
    }

    public async nextPage() {
        const item = this.history.at(-1);

        if (item) {
            item.index++;
        }

        return this.getOptions();
    }

    private async addHistoryItem(term: string) {
        const item = new HistoryItem(term, await this.api.define(term));

        this.history.push(item);

        return item;
    }

    private getOptions(): OutputOptions {
        const item = this.history.at(-1);

        return item
            ? {
                urbanDictionary: this,
                definition: item.getDefinition(),
                history: this.history,
                pagination: {
                    currentPage: item.index,
                    totalPages: item.definitions.length,
                },
            }
            : {
                urbanDictionary: this,
                definition: null,
                history: this.history,
                pagination: { currentPage: 0, totalPages: 0 },
            };
    }
}

export class UrbanDictionaryCommand extends SlashCommand {
    public constructor(private readonly api: Api) {
        super({
            name: 'urban-dictionary',
            description: 'Urban dictionary',
            nsfw: true,
            options: [
                stringOption({
                    name: 'term',
                    description: 'The term to search for',
                    required: true,
                    autocomplete: true,
                }),
            ],
        });
    }

    public static create() {
        return new this(new UrbanDictionaryCachedApi(new Collection(), new Collection()));
    }

    public override async execute({ interaction }: ChatInputContext) {
        await new UrbanDictionary(
            this.api,
            new InteractionHandler(interaction, new UrbanDictionaryComponentBuilder()),
        ).start(interaction.options.getString('term', true));
    }

    public override async autocomplete(interaction: AutocompleteInteraction) {
        const term = interaction.options.getFocused();

        if (!term) {
            return [];
        }

        const results = await this.api.autocomplete(term);

        return results.map((result) => ({ name: result, value: result }));
    }
}
