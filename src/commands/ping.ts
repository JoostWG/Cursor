import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { BaseCommand } from '../utils/command';

export default class PingCommand extends BaseCommand {
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
