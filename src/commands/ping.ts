import BaseCommand from '../utils/baseCommand';
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

export default class PingCommand extends BaseCommand {
    static devOnly = true;
    public static readonly data = new SlashCommandBuilder().setName('ping').setDescription('Ping!');

    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
