import axios from 'axios';
import { subtext, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { SlashCommand } from '../lib/core';
import type { ChatInputContext } from '../lib/core/context';
import type { OmitType } from '../lib/utils';
import { stringOption } from '../lib/utils/builders';

type IsEvenResponse =
    | { ad: string; iseven: boolean }
    | { error: string };

export class IsEvenCommand extends SlashCommand {
    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'is-even',
            description: 'Check whether a number is even',
            options: [
                stringOption({
                    name: 'number',
                    description: 'The number to check.',
                    required: true,
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const number = interaction.options.getString('number', true);

        const { data } = await axios.get<IsEvenResponse>(
            `https://api.isevenapi.xyz/api/iseven/${encodeURIComponent(number)}`,
            {
                validateStatus: (status) =>
                    (status >= 200 && status <= 299) || (status >= 400 && status <= 499),
            },
        );

        await interaction.reply({
            content: 'error' in data
                ? data.error
                : `${number} is${data.iseven ? ' ' : ' not '}an even number.\n${subtext(data.ad)}`,
        });
    }
}
