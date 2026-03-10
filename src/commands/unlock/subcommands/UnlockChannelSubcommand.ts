import { MessageFlags } from 'discord.js';
import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { mention } from '../../../lib/utils';
import { UnlockSubcommand } from './UnlockSubcommand';

export class UnlockChannelSubcommand extends UnlockSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'channel',
            description: 'Unlock a channel',
            options: [
                this.lockService.channelOption('unlock'),
                this.lockService.roleOption('unlock', 'channel'),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const channel = this.lockService.getChannel(interaction);
        const role = this.lockService.getRole(interaction);

        if (this.lockService.channelIsUnlocked(channel, role)) {
            throw new CommandError(`${mention(channel)} isn't locked for ${mention(role)}.`);
        }

        await this.lockService.unlockChannel(channel, role);

        await interaction.reply({
            content: `Unlocked ${mention(channel)} for ${mention(role)}.`,
            flags: [MessageFlags.Ephemeral],
        });
    }
}
