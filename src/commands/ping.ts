import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { SlashCommand } from '../core/command';

export default class PingCommand extends SlashCommand {
    public constructor() {
        super('ping');
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
