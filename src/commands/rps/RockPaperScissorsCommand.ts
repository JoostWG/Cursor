import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import type { CursorDatabase } from '../../database';
import { SlashCommand } from '../../lib/core';
import { SubcommandCollection } from '../../lib/core/collections';
import type { OmitType } from '../../lib/utils';
import { PlaySubcommand, StatsSubcommand } from './subcommands';

export class RockPaperScissorsCommand extends SlashCommand {
    public constructor(private readonly db: CursorDatabase) {
        super();
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'rps',
            description: 'Rock Paper Scissors',
        };
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new PlaySubcommand(this.db),
            new StatsSubcommand(this.db),
        );
    }
}
