import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Api } from 'jolpica-f1-api';
import { SlashCommand } from '../../lib/core';
import { SubcommandGroupCollection } from '../../lib/core/collections';
import type { OmitType } from '../../lib/utils';
import { FileApiCache } from './FileApiCache';
import { QuerySubcommandGroup } from './subcommand-groups';

export class F1Command extends SlashCommand {
    private readonly api: Api;

    public constructor() {
        super();

        this.api = new Api(new FileApiCache('./cache/f1'));

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
}
