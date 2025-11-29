import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { SlashCommand } from '../../lib/core';
import type { ChatInputContext } from '../../lib/core/context';
import type { OmitType } from '../../lib/utils';
import { Dice, Die, ScoreCard } from '../../modules/yahtzee';
import { Game } from './Game';

export class YahtzeeCommand extends SlashCommand {
    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'yahtzee',
            description: 'Yahtzee!',
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const game = new Game(
            interaction,
            new ScoreCard(),
            new Dice(new Die(), new Die(), new Die(), new Die(), new Die()),
        );

        await game.start();
    }
}
