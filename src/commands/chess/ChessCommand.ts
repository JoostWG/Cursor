import type { RESTPostAPIChatInputApplicationCommandsJSONBody, Snowflake } from 'discord.js';
import { SlashCommand, SubcommandCollection } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import type { Game } from './Game';
import { MoveSubcommand, StartSubcommand } from './subcommands';

export class ChessCommand extends SlashCommand {
    private readonly games: Map<Snowflake, Game>;

    public constructor() {
        super();

        this.games = new Map();
        this.devOnly = true;
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'chess',
            description: 'Play some chess!',
        };
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new StartSubcommand(this.games),
            new MoveSubcommand(this.games),
        );
    }
}
