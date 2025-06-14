import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { SlashCommand } from '../core/command';
import type { Context } from '../core/context';

export default class PingCommand extends SlashCommand {
    public constructor() {
        super('ping');
    }

    public override async execute({ interaction }: Context<ChatInputCommandInteraction>) {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
