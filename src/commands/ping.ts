import { Client } from '..';
import { BaseCommand } from '../utils/command';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export default class PingCommand extends BaseCommand {
    public constructor(client: Client) {
        super(client, 'ping');
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
