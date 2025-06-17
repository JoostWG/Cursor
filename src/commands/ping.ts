import { MessageFlags } from 'discord.js';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';

export default class PingCommand extends SlashCommand {
    public constructor() {
        super('ping', 'Pong!');
    }

    public override async execute({ interaction }: ChatInputContext) {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
