import { MessageFlags } from 'discord.js';
import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { mention } from '../../../lib/utils';
import { LockSubcommand } from './LockSubcommand';

export class LockServerSubcommand extends LockSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'server',
            description: 'Lock the server',
            options: [
                this.lockService.roleOption('lock', 'server'),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const role = this.lockService.getRole(interaction);

        if (this.lockService.guildIsLocked(role)) {
            throw new CommandError(`The server is already locked for ${mention(role)}.`);
        }

        await this.lockService.lockGuild(role);

        await interaction.reply({
            content: `Locked the server for ${mention(role)}.`,
            flags: [MessageFlags.Ephemeral],
        });
    }
}
