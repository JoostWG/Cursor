import { getTranslations } from '../utils';
import { BaseCommand } from '../utils/command';
import axios from 'axios';
import {
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    Locale,
    MessageFlags,
    TextChannel,
    bold,
    spoiler,
} from 'discord.js';
import i18next from 'i18next';

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

export default class JokeCommand extends BaseCommand {
    public constructor() {
        super('joke', 'Tells you a joke');

        this.devOnly = true;

        this.data
            .addStringOption((option) =>
                this.wrapOption(option, 'category', 'Choose a category').addChoices(
                    Object.entries(JokeCategory).map(([name, key]) => {
                        return {
                            name,
                            value: key,
                            name_localizations: getTranslations('commands.joke.categories.' + key),
                        };
                    }),
                ),
            )
            .addBooleanOption((option) =>
                this.wrapOption(
                    option,
                    'safe',
                    'Whether the joke must be safe. Defaults to true. Setting this to false requires an NSFW channel.',
                ),
            );
    }

    public async execute(interaction: ChatInputCommandInteraction) {
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
            await interaction.reply({
                content: i18next.t('commands.joke.nsfw', {
                    lng: interaction.locale,
                }),
                flags: MessageFlags.Ephemeral,
            });
            return;
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
            const { data } = await axios.get<
                SingleJokeResponse | MultipleJokesResponse | ErrorResponse
            >(`https://v2.jokeapi.dev/joke/${category}`, {
                params: {
                    amount: 1,
                    lang: language,
                    safe: safe,
                    blacklistFlags: blacklistFlags,
                },
            });

            if (data.error) {
                await interaction.reply({
                    embeds: [this.buildErrorEmbed(data)],
                });
            }
            if (data.error || 'jokes' in data) {
                await interaction.reply({
                    content: 'Something went wrong...',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            await interaction.reply(
                bold(data.category) +
                    '\n' +
                    (data.type === 'single'
                        ? data.joke
                        : data.setup + '\n' + spoiler(data.delivery)),
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                await interaction.reply({
                    embeds: [this.buildErrorEmbed(error.response?.data as ErrorResponse)],
                });
                console.error('Axios error:', error.response?.data || error.message);
            } else {
                await interaction.reply({
                    content: 'Something went wrong...',
                    flags: MessageFlags.Ephemeral,
                });
                console.error('Unexpected error:', error);
            }
        }
    }

    private buildErrorEmbed(error?: ErrorResponse) {
        if (error) {
            return new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`${error.code} ${error.message}`)
                .setDescription(`${error.causedBy.join('\n')}\n\n${error.additionalInfo}`);
        } else {
            return new EmbedBuilder().setColor(Colors.Red).setTitle('Unknown error');
        }
    }
}
