import { BaseCommand } from '../utils/command';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    ContainerBuilder,
    DiscordAPIError,
    Interaction,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    Role,
    TextDisplayBuilder,
    TimestampStyles,
    heading,
    roleMention,
    subtext,
    time,
} from 'discord.js';

class InvalidRoleError extends Error {
    //
}

export default class RoleCommand extends BaseCommand {
    public constructor() {
        super('role', 'Role utility');

        this.data
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .setContexts(InteractionContextType.Guild)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('delete')
                    .setDescription('Delete a role')
                    .addRoleOption((option) =>
                        option
                            .setName('role')
                            .setDescription('The role to delete')
                            .setRequired(true),
                    ),
            );
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) {
            await interaction.reply({
                content: 'Unable to execute command.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case 'delete':
                await this.handleDeleteSubcommand(interaction);
                break;

            default:
                await interaction.reply({
                    content: `No corresponding subcommand handler found for ${inlineCode(interaction.options.getSubcommand())}.`,
                    flags: MessageFlags.Ephemeral,
                });
                break;
        }
    }

    private async handleDeleteSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const timeout = 10; // Show confirmation modal for 10 seconds
        const role = interaction.options.getRole('role', true);

        try {
            this.validateRole(interaction, role);
        } catch (error) {
            await interaction.reply({
                content:
                    '⚠️ ' +
                    (error instanceof InvalidRoleError
                        ? error.message
                        : 'Something went wrong validating role input'),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const response = await interaction.reply({
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            withResponse: true,
            components: [
                new ContainerBuilder()
                    .setAccentColor(Colors.Red)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            [
                                heading('⚠️ Hold up!'),
                                `Are you sure you want to delete ${roleMention(role.id)}?`,
                                subtext('This action cannot be undone.'),
                            ].join('\n'),
                        ),
                    )
                    .addActionRowComponents(
                        // @ts-expect-error: Bug
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('cancel')
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel('Cancel'),
                            new ButtonBuilder()
                                .setCustomId('confirm')
                                .setStyle(ButtonStyle.Danger)
                                .setLabel('Delete role'),
                        ),
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            subtext(
                                // + 1 because it lines up better
                                `This message disappears ${time(Math.floor(Date.now() / 1000 + timeout + 1), TimestampStyles.RelativeTime)}`,
                            ),
                        ),
                    ),
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
                    components: [new TextDisplayBuilder().setContent('Role delete cancelled.')],
                });
                return;

            case 'confirm':
                try {
                    await interaction.guild.roles.delete(role.id);
                } catch (error) {
                    if (!(error instanceof DiscordAPIError)) {
                        throw error;
                    }

                    await confirmInteraction.update({
                        components: [
                            new TextDisplayBuilder().setContent(
                                'Role delete failed.' + error.message,
                            ),
                        ],
                    });

                    return;
                }

                await confirmInteraction.update({
                    components: [
                        new ContainerBuilder()
                            .setAccentColor(Colors.Green)
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    [
                                        heading('Role deleted'),
                                        'The role was deleted successfully.',
                                    ].join('\n'),
                                ),
                            ),
                    ],
                });
        }
    }

    private validateRole(
        interaction: Interaction<'cached'>,
        role: Role,
        options?: { allowManaged?: boolean; allowEveryone?: boolean },
    ) {
        // TODO
        // I'm not sure, but this function may need some more checks to also work properly
        // when the user is server owner

        if (role.id === interaction.guild.id && !options?.allowEveryone) {
            throw new InvalidRoleError('Cannot modify @everyone role.');
        }

        if (role.managed && !options?.allowManaged) {
            throw new InvalidRoleError('Target role is managed and cannot be modified.');
        }

        if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            throw new InvalidRoleError('Bot missing Manage Roles permission.');
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            throw new InvalidRoleError('User missing Manage Roles permission.');
        }

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            throw new InvalidRoleError('Bot highest role not above target role.');
        }

        if (role.position >= interaction.member.roles.highest.position) {
            throw new InvalidRoleError('User highest role not above target role.');
        }
    }
}
