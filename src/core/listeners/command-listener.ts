import { type CommandInteraction, Events, type Interaction, MessageFlags } from 'discord.js';
import type { CursorDatabase } from '../../setup';
import { CommandError } from '../command';
import type { CommandCollection } from '../command-collection';
import { ChatInputContext, MessageContextMenuContext, UserContextMenuContext } from '../context';
import { eventListener } from '../event-listener';

export class CommandListener extends eventListener(Events.InteractionCreate) {
    public constructor(
        private readonly commands: CommandCollection,
        private readonly db: CursorDatabase,
    ) {
        super();
    }

    public override async execute(interaction: Interaction) {
        if (!interaction.isCommand()) {
            return;
        }

        const command = this.commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply({
                content: 'Command not found.',
                flags: MessageFlags.Ephemeral,
            });
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        this.logInteractionToDatabase(interaction).catch(console.error);

        try {
            if (interaction.isChatInputCommand() && command.isSlashCommand()) {
                await command.execute(new ChatInputContext(interaction));
            } else if (interaction.isUserContextMenuCommand() && command.isUserContextMenu()) {
                await command.execute(new UserContextMenuContext(interaction));
            } else if (
                interaction.isMessageContextMenuCommand()
                && command.isMessageContextMenu()
            ) {
                await command.execute(new MessageContextMenuContext(interaction));
            } else {
                await interaction.reply({
                    content: 'Command not found.',
                    flags: MessageFlags.Ephemeral,
                });

                console.error(`No valid command handler found for ${interaction.commandName}.`);
            }
        } catch (error) {
            let message: string;

            if (error instanceof CommandError) {
                message = `⚠️ ${error.message}`;
            } else {
                message = 'There was an error while executing this command!';
                console.error(error);
            }

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: message,
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: message,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }

    private async logInteractionToDatabase(interaction: CommandInteraction) {
        await this.db
            .insertInto('command_logs')
            .values({
                interaction_id: interaction.id,
                user_id: interaction.user.id,
                channel_id: interaction.channelId,
                guild_id: interaction.inGuild() ? interaction.guildId : null,
                command_name: interaction.commandName,
                command_type: interaction.commandType,
                options: JSON.stringify(
                    interaction.isChatInputCommand() ? interaction.options.data : [],
                ),
            })
            .execute();
    }
}
