import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import type { CursorDatabase } from '../../database';
import { SlashCommand, SubcommandCollection } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { EconomyService } from '../../services';
import { BalanceSubcommand, BetSubcommand } from './subcommands';

export class EconomyCommand extends SlashCommand {
    private readonly economy: EconomyService;

    public constructor(db: CursorDatabase) {
        super();

        this.economy = new EconomyService(db);

        this.devOnly = true;
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'economy',
            description: 'Idk',
        };
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new BalanceSubcommand(this.economy),
            new BetSubcommand(this.economy),
        );
    }
}
