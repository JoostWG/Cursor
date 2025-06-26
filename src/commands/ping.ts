import { MessageFlags } from 'discord.js';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';

export class PingCommand extends SlashCommand {
    public constructor() {
        super({
            name: 'ping',
            description: 'Pong!',
        });
    }

    public override async execute({ interaction }: ChatInputContext): Promise<void> {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
