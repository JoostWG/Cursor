import { BaseCommand } from '../utils/command';
import axios from 'axios';
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    HeadingLevel,
    Locale,
    MessageFlags,
    SeparatorBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextDisplayBuilder,
    heading,
    inlineCode,
    subtext,
} from 'discord.js';
import i18next from 'i18next';

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

const hyperlinkRegex = /\[([^[\]]+)]/gm;

class ApiError extends Error {
    //
}

class Api {
    private static axios = axios.create({
        baseURL: 'https://api.urbandictionary.com/v0',
    });

    private static async get<T>(url: string, config?: axios.AxiosRequestConfig) {
        const { data } = await this.axios.get<ResponseData<T>>(url, config);

        // `data` can be anything
        if (typeof data === 'object' && !Array.isArray(data) && data !== null && 'error' in data) {
            throw new ApiError(typeof data.error === 'number' ? data.error.toString() : data.error);
        }

        return data;
    }

    public static async define(term: string) {
        const data = await this.get<{ list: Definition[] }>('/define', { params: { term } });

        return data.list;
    }

    public static async autocomplete(term: string) {
        return await this.get<string[]>('/autocomplete', { params: { term } });
    }
}

// This class is a mess (kinda), but works well
class UrbanDictionaryView {
    private cache: Map<string, Definition[]>;
    private history: { term: string; index: number }[];
    private locale?: Locale;
    private active: boolean;

    public constructor(initialTerm: string) {
        this.cache = new Map();
        this.history = [{ term: initialTerm, index: 0 }];
        this.active = true;
    }

    public async start(interaction: ChatInputCommandInteraction) {
        this.locale = interaction.locale;

        await this.loadDefinitions();

        if (!this.definitions.length) {
            await interaction.reply({
                content: i18next.t('commands:urban-dictionary.notFound', { lng: this.locale }),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const response = await interaction.reply({
            components: this.buildComponents(),
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
                filter: (i) => i.user.id === interaction.user.id,
            })
            .on('collect', async (interaction) => {
                collector.resetTimer();

                switch (interaction.customId) {
                    case 'previous':
                        this.current.index--;
                        break;

                    case 'next':
                        this.current.index++;
                        break;

                    case 'select':
                        if (!interaction.isStringSelectMenu()) {
                            break;
                        }

                        this.history.push({ term: interaction.values[0], index: 0 });
                        await this.loadDefinitions();
                        break;

                    case 'back':
                        this.history.pop();
                        break;
                }

                await interaction.update({ components: this.buildComponents() });
            })
            .on('end', async () => {
                this.active = false;
                await interaction.editReply({ components: this.buildComponents() });
            });
    }

    private async loadDefinitions() {
        if (this.cache.has(this.current.term)) {
            return;
        }

        this.cache.set(this.current.term, await Api.define(this.current.term));
    }

    private buildComponents() {
        const definition = this.definitions[this.current.index];

        const hyperlinkTerms = [
            ...this.extractHyperlinks(definition.definition),
            ...this.extractHyperlinks(definition.example),
        ];

        return [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        [
                            heading(definition.word),
                            subtext(`By ${definition.author}`),
                            this.transformHyperlinks(definition.definition),
                            heading('Example', HeadingLevel.Three),
                            this.transformHyperlinks(definition.example),
                        ].join('\n'),
                    ),
                )
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        inlineCode(this.history.map((item) => item.term).join(' > ')),
                    ),
                )
                .addActionRowComponents(
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('select')
                            .setPlaceholder(
                                i18next.t('commands:urban-dictionary.select', {
                                    lng: this.locale,
                                }),
                            )
                            .addOptions(
                                hyperlinkTerms.length
                                    ? hyperlinkTerms.map((term) =>
                                          new StringSelectMenuOptionBuilder()
                                              .setLabel(term)
                                              .setValue(term),
                                      )
                                    : [
                                          new StringSelectMenuOptionBuilder()
                                              .setLabel('null')
                                              .setValue('null'),
                                      ],
                            )
                            .setDisabled(!hyperlinkTerms.length || !this.active),
                    ),
                )
                .addActionRowComponents(
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId('back')
                            .setLabel(i18next.t('back', { lng: this.locale }))
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(this.history.length < 2 || !this.active),
                    ),
                )
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                .addActionRowComponents(
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel(i18next.t('previous', { lng: this.locale }))
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(this.current.index <= 0 || !this.active),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel(i18next.t('next', { lng: this.locale }))
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(
                                this.current.index + 1 >= this.definitions.length || !this.active,
                            ),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(i18next.t('openInBrowser', { lng: this.locale }))
                            .setURL(definition.permalink),
                    ),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        subtext(`${this.current.index + 1}/${this.definitions.length}`),
                    ),
                ),
        ];
    }

    private extractHyperlinks(text: string) {
        return text.matchAll(hyperlinkRegex).map((match) => match[1]);
    }

    private transformHyperlinks(text: string) {
        return text.replace(hyperlinkRegex, (_, term) => `[${term}](${this.getWebUrl(term)})`);
    }

    private getWebUrl(term: string) {
        return `https://urbandictionary.com/define.php?term=${encodeURIComponent(term)}`;
    }

    private get current() {
        return this.history.at(-1) as { term: string; index: number };
    }

    private get definitions() {
        return this.cache.get(this.current.term) as Definition[];
    }
}

export default class UrbanDictionaryCommand extends BaseCommand {
    public constructor() {
        super('urban-dictionary', 'Search Urban Dictionary');

        this.data
            .setNSFW(true)
            .addStringOption((option) =>
                this.wrapOption(option, 'term', 'The term to search for')
                    .setRequired(true)
                    .setAutocomplete(true),
            );
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        await new UrbanDictionaryView(interaction.options.getString('term', true)).start(
            interaction,
        );
    }

    public override async autocomplete(interaction: AutocompleteInteraction) {
        const term = interaction.options.getFocused();

        if (!term) {
            return [];
        }

        const results = await Api.autocomplete(term);

        return results.map((result) => ({ name: result, value: result }));
    }
}
