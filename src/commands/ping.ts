import { SlashCommand } from '@/lib/core';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export class PingCommand extends SlashCommand {
    public constructor() {
        super({
            name: 'ping',
            description: 'Pong!',
        });
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
