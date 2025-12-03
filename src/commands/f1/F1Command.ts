import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Api } from 'jolpica-f1-api';
import { SlashCommand, SubcommandCollection, SubcommandGroupCollection } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { FileApiCache } from './FileApiCache';
import { QuerySubcommandGroup } from './subcommand-groups';
import { DriverStandingsSubcommand, ResultsSubcommand } from './subcommands';

export class F1Command extends SlashCommand {
    private readonly api: Api;

    public constructor() {
        super();

        this.api = new Api({ cache: new FileApiCache('./cache/f1') });

        this.devOnly = true;
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'f1',
            description: 'Formula 1',
        };
    }

    protected override subcommandGroups(): SubcommandGroupCollection {
        return new SubcommandGroupCollection(
            new QuerySubcommandGroup(this.api),
        );
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new ResultsSubcommand(this.api),
            new DriverStandingsSubcommand(this.api),
        );
    }
}
