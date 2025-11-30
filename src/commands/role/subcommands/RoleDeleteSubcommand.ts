import {
    ButtonStyle,
    Colors,
    DiscordAPIError,
    MessageFlags,
    TimestampStyles,
    bold,
    heading,
    roleMention,
    subtext,
    time,
} from 'discord.js';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import {
    actionRow,
    button,
    container,
    roleOption,
    stringOption,
    textDisplay,
} from '../../../lib/utils/builders';
import { RoleSubCommand } from './RoleSubcommand';

export class RoleDeleteSubcommand extends RoleSubCommand {
    protected override definition(): SubcommandDefinition {
        return {
            name: 'delete',
            description: 'Delete a role',
            options: [
                roleOption({
                    name: 'role',
                    description: 'The role to delete',
                    required: true,
                }),
                stringOption({
                    name: 'reason',
                    description: 'The reason for deleting the role',
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext<'cached'>): Promise<void> {
        const timeout = 10; // Show confirmation modal for 10 seconds
        const role = interaction.options.getRole('role', true);
        const reason = interaction.options.getString('reason') ?? undefined;

        this.roleService.validateRole(interaction, role);

        const response = await interaction.reply({
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            withResponse: true,
            components: [
                container({
                    accent_color: Colors.Red,
                    components: [
                        textDisplay({
                            content: [
                                heading('⚠️ Hold up!'),
                                `Are you sure you want to delete ${roleMention(role.id)}?`,
                                subtext('This action cannot be undone.'),
                            ].join('\n'),
                        }),
                        actionRow({
                            components: [
                                button({
                                    style: ButtonStyle.Secondary,
                                    label: 'Cancel',
                                    custom_id: 'cancel',
                                }),
                                button({
                                    style: ButtonStyle.Danger,
                                    label: 'Delete role',
                                    custom_id: 'confirm',
                                }),
                            ],
                        }),
                        textDisplay({
                            content: subtext(
                                // + 1 because it lines up better
                                `This message disappears ${
                                    time(
                                        Math.floor(Date.now() / 1000 + timeout + 1),
                                        TimestampStyles.RelativeTime,
                                    )
                                }`,
                            ),
                        }),
                    ],
                }),
            ],
        });

        if (!response.resource?.message) {
            // TODO: Inform user
            console.error('role delete command missing response.resource.message');

            return;
        }

        let confirmInteraction;

        try {
            confirmInteraction = await response.resource.message.awaitMessageComponent({
                time: timeout * 1000,
                filter: (i) => i.user.id === interaction.user.id,
            });
        } catch {
            await interaction.deleteReply();

            return;
        }

        switch (confirmInteraction.customId) {
            case 'cancel':
                await confirmInteraction.update({
                    components: [textDisplay({ content: 'Role delete cancelled.' })],
                });

                return;

            case 'confirm':
                try {
                    await interaction.guild.roles.delete(role.id, reason);
                } catch (error) {
                    if (!(error instanceof DiscordAPIError)) {
                        throw error;
                    }

                    await confirmInteraction.update({
                        components: [
                            textDisplay({ content: `Role delete failed.${error.message}` }),
                        ],
                    });

                    return;
                }

                await confirmInteraction.update({
                    components: [
                        container({
                            accent_color: Colors.Green,
                            components: [
                                textDisplay({
                                    content: [
                                        heading('Role deleted'),
                                        'The role was deleted successfully.',
                                        '',
                                        bold('Reason'),
                                        reason,
                                    ].join('\n'),
                                }),
                            ],
                        }),
                    ],
                });
        }
    }
}
