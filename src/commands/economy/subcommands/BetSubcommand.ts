import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { integerOption } from '../../../lib/utils/builders';
import { EconomySubcommand } from './EconomySubcommand';

export class BetSubcommand extends EconomySubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'bet',
            description: 'Waste of money...',
            options: [
                integerOption({
                    name: 'amount',
                    description: 'The amount of money to waste',
                    required: true,
                    min_value: 0,
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const amount = interaction.options.getInteger('amount', true);

        if (amount < 1) {
            throw new CommandError('Bet something you loser!');
        }

        const balance = await this.economy.getBalance(interaction.user);

        if (amount > balance) {
            throw new CommandError(`You only have ${this.formatBalance(balance)} balance!`);
        }

        const random = Math.floor(Math.random() * 2);

        const newBalance = balance + (random * 2 - 1) * amount;

        this.economy.setBalance(interaction.user, newBalance).catch(console.error);

        await interaction.reply(
            `You ${random ? 'won' : 'lost'}! New balance is ${this.formatBalance(newBalance)}`,
        );
    }
}
