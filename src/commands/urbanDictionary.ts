import { BaseCommand } from '../utils/command';
import axios from 'axios';
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    InteractionReplyOptions,
    Locale,
    MessageFlags,
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

type ResponseData =
    | {
          list: Definition[];
      }
    | {
          error: string | number;
      };

class DefinitionsView {
    private definitions: Definition[];
    private index: number;
    private locale?: Locale;

    public constructor(definitions: Definition[]) {
        this.definitions = definitions;
        this.index = 0;
    }

    public async send(interaction: ChatInputCommandInteraction) {
        this.locale = interaction.locale;
        const response = await interaction.reply(this.buildMessage({ withResponse: true }));

        if (!response.resource || !response.resource.message) {
            console.error('Error...');
            return;
        }

        response.resource.message
            .createMessageComponentCollector({
                time: 60_000,
                filter: (i) => i.user.id === interaction.user.id,
            })
            .on('collect', async (interaction) => {
                switch (interaction.customId) {
                    case 'previous':
                        this.index--;
                        break;
                    case 'next':
                        this.index++;
                        break;
                }

                await interaction.update(this.buildMessage());
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private buildMessage<E extends Record<string, any>>(
        extra?: E,
    ): Pick<InteractionReplyOptions, 'content' | 'embeds' | 'components'> & E {
        const definition = this.definitions[this.index];
        // @ts-expect-error: Caused by `components`. Following guide, works at runtime.
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle(definition.word)
                    .setDescription(this.transformHyperlinks(definition.definition))
                    .addFields({
                        name: 'Example',
                        value: this.transformHyperlinks(definition.example),
                        inline: false,
                    })
                    .setTimestamp(new Date(definition.written_on))
                    .setFooter({
                        text: `👍${definition.thumbs_up} 👎${definition.thumbs_down}`,
                    }),
            ],
            components: [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel(i18next.t('common.previous', { lng: this.locale }))
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(this.index <= 0),
                    new ButtonBuilder()
                        .setCustomId('page')
                        .setLabel(`${this.index + 1}/${this.definitions.length}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel(i18next.t('common.next', { lng: this.locale }))
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(this.index + 1 >= this.definitions.length),
                ]),
            ],
            ...extra,
        };
    }

    private transformHyperlinks(text: string) {
        return text.replace(/\[([^[\]]+)]/gm, (_, term) => `[${term}](${this.getWebUrl(term)})`);
    }

    private getWebUrl(term: string) {
        return `https://urbandictionary.com/define.php?term=${encodeURIComponent(term)}`;
    }
}

export default class UrbanDictionaryCommand extends BaseCommand {
    private api: axios.AxiosInstance;

    public constructor() {
        super('urban-dictionary', 'Search Urban Dictionary');

        this.devOnly = true;
        this.data
            .setNSFW(true)
            .addSubcommand((subcommand) =>
                this.wrapSubcommand(subcommand, 'search', 'Search for a term').addStringOption(
                    (option) =>
                        this.wrapOption(option, 'term', 'The term to search for', 'search')
                            .setAutocomplete(true)
                            .setRequired(true),
                ),
            )
            .addSubcommand((subcommand) =>
                this.wrapSubcommand(subcommand, 'random', 'Returns some random definitions'),
            );

        this.api = axios.create({
            baseURL: 'https://api.urbandictionary.com/v0',
        });
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        let response: axios.AxiosResponse<ResponseData>;

        switch (interaction.options.getSubcommand()) {
            case 'search':
                response = await this.api.get<ResponseData>('/define', {
                    params: { term: interaction.options.getString('term') },
                });
                break;

            case 'random':
                response = await this.api.get<ResponseData>('/random');
                break;

            default:
                await interaction.reply({
                    content: 'Missing subcommand handler',
                    flags: MessageFlags.Ephemeral,
                });
                return;
        }

        if (response.status !== 200 || 'error' in response.data) {
            await interaction.reply({
                content: 'Error...',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await new DefinitionsView(response.data.list).send(interaction);
    }

    public override async autocomplete(interaction: AutocompleteInteraction) {
        const term = interaction.options.getFocused();

        if (!term) {
            return [];
        }

        const { data } = await this.api.get<string[]>('/autocomplete', {
            params: { term },
        });

        return data.map((result) => ({ name: result, value: result }));
    }
}
