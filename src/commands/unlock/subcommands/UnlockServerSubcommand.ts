import { MessageFlags } from 'discord.js';
import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import { mention } from '../../../lib/utils';
import { UnlockSubcommand } from './UnlockSubcommand';

export class UnlockServerSubcommand extends UnlockSubcommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'server',
            description: 'Unlock the server',
            options: [
                this.lockService.roleOption('unlock', 'server'),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const role = this.lockService.getRole(interaction);

        if (this.lockService.guildIsUnlocked(role)) {
            throw new CommandError(`The server isn't locked for ${mention(role)}.`);
        }

        await this.lockService.unlockGuild(role);

        await interaction.reply({
            content: `Unlocked the server for ${mention(role)}.`,
            flags: [MessageFlags.Ephemeral],
        });
    }
}
