import type { ChatInputCommandInteraction } from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import { EconomySubcommand } from './EconomySubcommand';

export class BalanceSubcommand extends EconomySubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'balance',
            description: 'Get your current balance',
        };
    }

    protected override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const balance = await this.economy.getBalance(interaction.user);

        await interaction.reply(`Your current balance is ${this.formatBalance(balance)}`);
    }
}
