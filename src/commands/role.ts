import { BaseCommand } from '../utils/command';
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Collection,
    Colors,
    ContainerBuilder,
    DiscordAPIError,
    HeadingLevel,
    Interaction,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    Role,
    RoleEditOptions,
    TextDisplayBuilder,
    TimestampStyles,
    bold,
    heading,
    inlineCode,
    roleMention,
    subtext,
    time,
} from 'discord.js';

class InvalidRoleError extends Error {
    //
}

type AllowedRoleProps = 'name' | 'color' | 'hoist' | 'mentionable';

export default class RoleCommand extends BaseCommand {
    public constructor() {
        super('role', 'Role utility');

        this.data
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .setContexts(InteractionContextType.Guild)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('update')
                    .setDescription('Update a role')
                    .addRoleOption((option) =>
                        option
                            .setName('role')
                            .setDescription('The role you want to update')
                            .setRequired(true),
                    )
                    .addStringOption((option) =>
                        option
                            .setName('name')
                            .setDescription('Change the name of the role')
                            .setMaxLength(100),
                    )
                    .addStringOption((option) =>
                        option
                            .setName('color')
                            .setDescription('Change the color of the role')
                            .setAutocomplete(true),
                    )
                    .addBooleanOption((option) =>
                        option
                            .setName('hoisted')
                            .setDescription('Change whether the role should be hoisted or not'),
                    )
                    .addBooleanOption((option) =>
                        option
                            .setName('mentionable')
                            .setDescription('Change whether the role should be mentionable or not'),
                    )
                    .addStringOption((option) =>
                        option.setName('reason').setDescription('The reason for updating the role'),
                    ),
            )
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

    public override async autocomplete(interaction: AutocompleteInteraction) {
        if (interaction.options.getFocused(true).name !== 'color') {
            return [];
        }

        const q = interaction.options.getFocused().toLowerCase();

        return Object.entries(Colors)
            .map(([name, value]) => ({
                // Convert PascalCase to normal text
                name: name.replaceAll(/([a-z])([A-Z])/g, (_, a, b) => `${a} ${b.toLowerCase()}`),
                value: `#${value.toString(16)}`,
            }))
            .filter(({ name }) => name.toLowerCase().includes(q))
            .toSorted(
                ({ name: aName }, { name: bName }) =>
                    aName.toLowerCase().indexOf(q) - bName.toLowerCase().indexOf(q),
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

        try {
            switch (interaction.options.getSubcommand()) {
                case 'update':
                    await this.handleUpdateSubcommand(interaction);
                    break;

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
        } catch (error) {
            if (!(error instanceof InvalidRoleError)) {
                throw error;
            }

            await interaction.reply({
                content: '⚠️ ' + error.message,
                flags: MessageFlags.Ephemeral,
            });

            return;
        }
    }

    private async handleUpdateSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const role = interaction.options.getRole('role', true);

        this.validateRole(interaction, role, { allowManaged: true });

        const options: Partial<Pick<RoleEditOptions, AllowedRoleProps>> = {
            name: interaction.options.getString('name') ?? undefined,
            hoist: interaction.options.getBoolean('hoisted') ?? undefined,
            mentionable: interaction.options.getBoolean('mentionable') ?? undefined,
        };

        const colorInput = interaction.options.getString('color');

        if (colorInput) {
            // TODO: discord.js resolveColor
            const pattern = /^(?:#|0x)?([0-9a-fA-F]{6})$/;
            const match = colorInput.match(pattern);

            if (!match) {
                await interaction.reply({
                    content: `Invalid color. Must match ${inlineCode(pattern.toString())}`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            options.color = parseInt(match[1], 16);
        }

        const reason = interaction.options.getString('reason') ?? undefined;

        const oldProps = new Collection<AllowedRoleProps, Role[AllowedRoleProps]>([
            ['name', role.name],
            ['color', role.color],
            ['hoist', role.hoist],
            ['mentionable', role.mentionable],
        ]);

        try {
            await role.edit({ ...options, reason });
        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: 'Something went wrong updating the role.',
                flags: MessageFlags.Ephemeral,
            });

            return;
        }

        const changes = oldProps
            .filter((value, key) => value !== role[key])
            .mapValues((value, key) => ({ old: value, new: role[key] }));

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        [
                            heading(`Updated ${roleMention(role.id)}`, HeadingLevel.Three),
                            ...changes.map((value, key) =>
                                [
                                    'Set',
                                    bold(key),
                                    'from',
                                    inlineCode(
                                        key === 'color'
                                            ? `#${value.old.toString(16)}`
                                            : value.old.toString(),
                                    ),
                                    'to',
                                    inlineCode(
                                        key === 'color'
                                            ? `#${value.new.toString(16)}`
                                            : value.new.toString(),
                                    ),
                                ].join(' '),
                            ),
                            '',
                            bold('Reason'),
                            reason ?? 'No reason given',
                        ].join('\n'),
                    ),
                ),
            ],
        });
    }

    private async handleDeleteSubcommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const timeout = 10; // Show confirmation modal for 10 seconds
        const role = interaction.options.getRole('role', true);

        this.validateRole(interaction, role);

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
