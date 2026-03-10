import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { GuildSlashCommand, SubcommandCollection } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { LockService } from '../../services';
import { LockChannelSubcommand } from './subcommands/LockChannelSubcommand';
import { LockServerSubcommand } from './subcommands/LockServerSubcommand';

export class LockCommand extends GuildSlashCommand {
    protected readonly service: LockService;

    public constructor() {
        super();

        this.service = new LockService();
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'lock',
            description: 'Lock a channel, or the entire server.',
        };
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new LockChannelSubcommand(this.service),
            new LockServerSubcommand(this.service),
        );
    }
}
