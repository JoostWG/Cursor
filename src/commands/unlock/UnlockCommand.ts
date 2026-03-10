import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { GuildSlashCommand, SubcommandCollection } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { LockService } from '../../services';
import { UnlockChannelSubcommand } from './subcommands/UnlockChannelSubcommand';
import { UnlockServerSubcommand } from './subcommands/UnlockServerSubcommand';

export class UnlockCommand extends GuildSlashCommand {
    protected readonly service: LockService;

    public constructor() {
        super();

        this.service = new LockService();
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'unlock',
            description: 'Unlock a channel, or the entire server.',
        };
    }

    protected override subcommands(): SubcommandCollection {
        return new SubcommandCollection(
            new UnlockChannelSubcommand(this.service),
            new UnlockServerSubcommand(this.service),
        );
    }
}
