import { SlashCommand } from '../../core/command';
import type { ChatInputContext } from '../../core/context';
import { Dice, Die, ScoreCard } from '../../modules/yahtzee';
import { Game } from './game';

export class YahtzeeCommand extends SlashCommand {
    public constructor() {
        super({
            name: 'yahtzee',
            description: 'Yahtzee!',
        });
    }

    public override async execute({ interaction }: ChatInputContext): Promise<void> {
        const game = new Game(
            interaction,
            new ScoreCard(),
            new Dice(new Die(), new Die(), new Die(), new Die(), new Die()),
        );

        await game.start();
    }
}
