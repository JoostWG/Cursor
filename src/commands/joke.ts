import axios from 'axios';
import { Colors, Locale, TextChannel, bold, spoiler, type APIEmbed } from 'discord.js';
import { CommandError, SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import { booleanOption, stringOption } from '../utils/builders';

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
    public constructor(private readonly api: axios.AxiosInstance) {
        super({
            name: 'joke',
            description: 'Have a laugh!',
            options: [
                stringOption({
                    name: 'category',
                    description: 'The joke category',
                    choices: Object.entries(JokeCategory).map(([name, key]) => ({
                        name,
                        value: key,
                    })),
                }),
                booleanOption({
                    name: 'safe',
                    description: [
                        'Whether the joke must be safe.',
                        'Defaults to `True`.',
                        'Setting this to `False` requires an NSFW channel.',
                    ].join(' '),
                }),
            ],
        });
    }

    public static create() {
        return new this(axios.create({
            baseURL: 'https://v2.jokeapi.dev',
        }));
    }

    public override async execute({ interaction }: ChatInputContext) {
        const category = interaction.options.getString('category') ?? 'Any';
        const safe = interaction.options.getBoolean('safe') ?? true;

        if (
            !safe
            && !(
                interaction.channel
                && interaction.channel instanceof TextChannel
                && interaction.channel.nsfw
            )
        ) {
            throw new CommandError('Setting `safe` to `False` can only be done in NSFW channels.');
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

    private buildErrorEmbed(error?: ErrorResponse): APIEmbed {
        if (error) {
            return {
                color: Colors.Red,
                title: `${error.code} ${error.message}`,
                description: `${error.causedBy.join('\n')}\n\n${error.additionalInfo}`,
            };
        }

        return {
            color: Colors.Red,
            title: 'Unknown error',
        };
    }
}
