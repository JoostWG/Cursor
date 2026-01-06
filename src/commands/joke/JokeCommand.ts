import axios, { type AxiosInstance } from 'axios';
import {
    Colors,
    Locale,
    TextChannel,
    bold,
    spoiler,
    type APIEmbed,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { CommandError } from '../../CommandError';
import { SlashCommand } from '../../lib/core';
import type { ChatInputContext } from '../../lib/core/context';
import type { OmitType } from '../../lib/utils';
import { booleanOption, stringOption } from '../../lib/utils/builders';
import { JokeCategory } from './JokeCategory';
import { JokeLanguage } from './JokeLanguage';
import { JokeResponseValidator } from './JokeResponseValidator';
import type { AnyResponse, ErrorResponse } from './types';

export class JokeCommand extends SlashCommand {
    private readonly api: AxiosInstance;
    private readonly validator: JokeResponseValidator;

    public constructor() {
        super();

        this.api = axios.create({
            baseURL: 'https://v2.jokeapi.dev',
        });

        this.validator = new JokeResponseValidator();
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
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
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const { category, safe } = this.getOptions(interaction);

        if (!safe && !this.allowUnsafe(interaction)) {
            throw new CommandError('Setting `safe` to `False` can only be done in NSFW channels.');
        }

        try {
            await this.handleResponse(
                interaction,
                await this.fetch({
                    category,
                    safe,
                    amount: 1,
                    language: this.getLanguage(interaction),
                }),
            );
        } catch (error) {
            if (!axios.isAxiosError(error)) {
                throw error;
            }

            const data = this.validateErrorResponse(error.response?.data);

            await interaction.reply({
                embeds: [this.buildErrorEmbed(data)],
            });

            console.error('Axios error:', data ?? error.message);
        }
    }

    private async handleResponse(
        interaction: ChatInputCommandInteraction,
        data: AnyResponse,
    ): Promise<void> {
        if (data.error) {
            await interaction.reply({
                embeds: [this.buildErrorEmbed(data)],
            });

            return;
        }

        if ('jokes' in data) {
            throw new CommandError('Multiple jokes not supported');
        }

        await interaction.reply(
            `${bold(data.category)}\n${
                data.type === 'single' ? data.joke : `${data.setup}\n${spoiler(data.delivery)}`
            }`,
        );
    }

    private getOptions(
        interaction: ChatInputCommandInteraction,
    ): { category: string; safe: boolean } {
        return {
            category: interaction.options.getString('category') ?? 'Any',
            safe: interaction.options.getBoolean('safe') ?? true,
        };
    }

    private allowUnsafe(interaction: ChatInputCommandInteraction): boolean {
        if (!interaction.channel) {
            return false;
        }

        return interaction.channel instanceof TextChannel && interaction.channel.nsfw;
    }

    private getLanguage(interaction: ChatInputCommandInteraction): JokeLanguage {
        const languageMap: Partial<Record<Locale, JokeLanguage>> = {
            [Locale.Czech]: JokeLanguage.Czech,
            [Locale.German]: JokeLanguage.German,
            [Locale.SpanishES]: JokeLanguage.Spanish,
            [Locale.SpanishLATAM]: JokeLanguage.Spanish,
            [Locale.French]: JokeLanguage.French,
            [Locale.PortugueseBR]: JokeLanguage.Portuguese,
        };

        return languageMap[interaction.locale] ?? JokeLanguage.English;
    }

    private async fetch(
        options: { category: string; amount: number; language: JokeLanguage; safe: boolean },
    ): Promise<AnyResponse> {
        const response = await this.api.get(`/joke/${options.category}`, {
            params: {
                amount: options.amount,
                lang: options.language,
                safe: options.safe,
                blacklistFlags: options.safe
                    ? 'nsfw,religious,political,racist,sexist,explicit'
                    : '',
            },
        });

        return this.validateResponse(response.data);
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

    private validateResponse(response: unknown): AnyResponse {
        return this.validator.anyResponse()(response, 'response');
    }

    private validateErrorResponse(response: unknown): ErrorResponse | undefined {
        return this.validator.optional(this.validator.errorResponse())(response, 'response');
    }
}
