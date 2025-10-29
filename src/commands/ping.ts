import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../lib/core';

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
