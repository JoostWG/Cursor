import axios from 'axios';
import {
    type ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    Locale,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    TextChannel,
    bold,
    spoiler,
} from 'discord.js';
import i18next from 'i18next';
import { CommandError, SlashCommand } from '../core/command';
import type { Context } from '../core/context';
import { getTranslations, localize } from '../utils';

type JokeBlacklistFlag = 'nsfw' | 'religious' | 'political' | 'racist' | 'sexist' | 'explicit';

enum JokeCategory {
    Programming = 'programming',
    Miscellaneous = 'misc',
    Dark = 'dark',
    Pun = 'pun',
    Spooky = 'spooky',
    Christmas = 'christmas',
}

enum JokeLanguage {
    Czech = 'cs',
    German = 'de',
    English = 'en',
    Spanish = 'es',
    French = 'fr',
    Portuguese = 'pt',
}

interface ErrorResponse {
    error: true;
    internalError: boolean;
    code: number;
    message: string;
    causedBy: string[];
    additionalInfo: string;
    timestamp: number;
}

interface SuccessResponse {
    error: false;
}

interface Joke {
    category: JokeCategory;
    flags: Record<JokeBlacklistFlag, boolean>;
    id: number;
    safe: boolean;
    lang: JokeLanguage;
}

interface SingleTypeJoke extends Joke {
    type: 'single';
    joke: string;
}

interface TwopartTypeJoke extends Joke {
    type: 'twopart';
    setup: string;
    delivery: string;
}

type SingleJokeResponse = SuccessResponse & (SingleTypeJoke | TwopartTypeJoke);

type MultipleJokesResponse = SuccessResponse & {
    amount: number;
    jokes: (SingleTypeJoke | TwopartTypeJoke)[];
};

export default class JokeCommand extends SlashCommand {
    private readonly api: axios.AxiosInstance;

    public constructor() {
        super('joke');

        this.data
            .addStringOption(
                localize(SlashCommandStringOption, 'category', 'joke.options.category').addChoices(
                    Object.entries(JokeCategory).map(([name, key]) => ({
                        name,
                        value: key,
                        name_localizations: getTranslations(`commands:joke.categories.${key}`),
                    })),
                ),
            )
            .addBooleanOption(localize(SlashCommandBooleanOption, 'safe', 'joke.options.safe'));

        this.api = axios.create({
            baseURL: 'https://v2.jokeapi.dev',
        });
    }

    public override async execute({ interaction }: Context<ChatInputCommandInteraction>) {
        const category = interaction.options.getString('category') ?? 'Any';
        const safe = interaction.options.getBoolean('safe') ?? true;

        if (
            !safe &&
            !(
                interaction.channel &&
                interaction.channel instanceof TextChannel &&
                interaction.channel.nsfw
            )
        ) {
            throw new CommandError(
                i18next.t('commands:joke.nsfw', {
                    lng: interaction.locale,
                }),
            );
        }

        const blacklistFlags = safe ? 'nsfw,religious,political,racist,sexist,explicit' : '';

        const languageMap: Partial<Record<Locale, JokeLanguage>> = {
            [Locale.Czech]: JokeLanguage.Czech,
            [Locale.German]: JokeLanguage.German,
            [Locale.SpanishES]: JokeLanguage.Spanish,
            [Locale.SpanishLATAM]: JokeLanguage.Spanish,
            [Locale.French]: JokeLanguage.French,
            [Locale.PortugueseBR]: JokeLanguage.Portuguese,
        };

        const language = languageMap[interaction.locale] ?? 'en';

        try {
            const { data } = await this.api.get<
                SingleJokeResponse | MultipleJokesResponse | ErrorResponse
            >(`/joke/${category}`, {
                params: {
                    amount: 1,
                    lang: language,
                    safe,
                    blacklistFlags,
                },
            });

            if (data.error) {
                await interaction.reply({
                    embeds: [this.buildErrorEmbed(data)],
                });
            }

            if (data.error || 'jokes' in data) {
                throw new CommandError('Something went wrong...');
            }

            await interaction.reply(
                `${bold(data.category)}\n${
                    data.type === 'single' ? data.joke : `${data.setup}\n${spoiler(data.delivery)}`
                }`,
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                await interaction.reply({
                    embeds: [this.buildErrorEmbed(error.response?.data as ErrorResponse)],
                });
                console.error('Axios error:', error.response?.data ?? error.message);
            } else {
                throw new CommandError('Something went wrong...');
            }
        }
    }

    private buildErrorEmbed(error?: ErrorResponse) {
        if (error) {
            return new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`${error.code} ${error.message}`)
                .setDescription(`${error.causedBy.join('\n')}\n\n${error.additionalInfo}`);
        }

        return new EmbedBuilder().setColor(Colors.Red).setTitle('Unknown error');
    }
}
