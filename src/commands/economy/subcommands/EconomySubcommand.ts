import { inlineCode } from 'discord.js';
import { Subcommand } from '../../../lib/core';
import type { EconomyService } from '../../../services';

export abstract class EconomySubcommand extends Subcommand {
    public constructor(protected readonly economy: EconomyService) {
        super();
    }

    protected formatBalance(balance: number): string {
        return inlineCode(Intl.NumberFormat().format(balance));
    }
}
