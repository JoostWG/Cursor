import { MessageFlags } from 'discord.js';
import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { mention } from '../../../lib/utils';
import { LockSubcommand } from './LockSubcommand';

export class LockChannelSubcommand extends LockSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'channel',
            description: 'Lock a channel',
            options: [
                this.lockService.channelOption('lock'),
                this.lockService.roleOption('lock', 'channel'),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const channel = this.lockService.getChannel(interaction);
        const role = this.lockService.getRole(interaction);

        if (this.lockService.channelIsLocked(channel, role)) {
            throw new CommandError(`${mention(channel)} is already locked for ${mention(role)}.`);
        }

        await this.lockService.lockChannel(channel, role);

        await interaction.reply({
            content: `Locked ${mention(channel)} for ${mention(role)}.`,
            flags: [MessageFlags.Ephemeral],
        });
    }
}
