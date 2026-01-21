import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { F1Api } from 'f1-garage/jolpica';
import { SlashCommand, SubcommandCollection, SubcommandGroupCollection } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { QuerySubcommandGroup } from './subcommand-groups';
import { DriverStandingsSubcommand, ResultsSubcommand, WinsSubcommand } from './subcommands';

export class F1Command extends SlashCommand {
    private readonly api: F1Api;

    public constructor() {
        super();

        // this.api = new Api({ cache: new FileApiCache('./cache/f1') });
        this.api = new F1Api();

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
            new WinsSubcommand(this.api),
        );
    }
}
