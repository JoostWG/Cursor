import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import type { CursorDatabase } from '../../database';
import { SlashCommand, type Subcommand } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { PlaySubcommand } from './subcommands/PlaySubcommand';
import { StatsSubcommand } from './subcommands/StatsSubcommand';

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

    protected override subcommands(): Subcommand[] {
        return [
            new PlaySubcommand(this.db),
            new StatsSubcommand(this.db),
        ];
    }
}
