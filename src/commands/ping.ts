import { BaseCommand } from '../utils/command';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export default class PingCommand extends BaseCommand {
    public constructor() {
        super('ping', 'Ping!');
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
