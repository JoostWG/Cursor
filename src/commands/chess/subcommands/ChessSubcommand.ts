import type { Snowflake } from 'discord.js';
import { Subcommand } from '../../../lib/core';
import type { Game } from '../Game';

export abstract class ChessSubcommand extends Subcommand {
    public constructor(protected readonly games: Map<Snowflake, Game>) {
        super();
    }
}
