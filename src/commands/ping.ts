import {
    MessageFlags,
    type ChatInputCommandInteraction,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { SlashCommand } from '../lib/core';
import type { OmitType } from '../lib/utils';

export class PingCommand extends SlashCommand {
    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'ping',
            description: 'Pong!',
        };
    }

    protected override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            content: 'Pong!',
            flags: MessageFlags.Ephemeral,
        });
    }
}
