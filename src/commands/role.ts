import {
    ActionRowBuilder,
    type AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    Collection,
    Colors,
    ContainerBuilder,
    DiscordAPIError,
    HeadingLevel,
    type Interaction,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    type Role,
    type RoleEditOptions,
    SlashCommandBooleanOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    TextDisplayBuilder,
    TimestampStyles,
    bold,
    heading,
    inlineCode,
    roleMention,
    subtext,
    time,
} from 'discord.js';
import { localize } from '../utils';
import { CommandError, SlashCommand } from '../utils/command';

class InvalidRoleError extends CommandError {
    //
}

type AllowedRoleProps = 'name' | 'color' | 'hoist' | 'mentionable';

export default class RoleCommand extends SlashCommand {
    public constructor() {
        super('role');

        this.data
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .setContexts(InteractionContextType.Guild)
            .addSubcommand(
                localize(SlashCommandSubcommandBuilder, 'role', 'role.subcommands.update')
                    .addRoleOption(
                        localize(
                            SlashCommandRoleOption,
                            'role',
                            'role.subcommands.update.options.role',
                        ).setRequired(true),
                    )
                    .addStringOption(
                        localize(
                            SlashCommandStringOption,
                            'name',
                            'role.subcommands.update.options.name',
                        ).setMaxLength(100),
                    )
                    .addStringOption(
                        localize(
                            SlashCommandStringOption,
                            'color',
                            'role.subcommands.update.options.color',
                        ).setAutocomplete(true),
                    )
                    .addBooleanOption(
                        localize(
                            SlashCommandBooleanOption,
                            'hoisted',
                            'role.subcommands.update.options.hoisted',
                        ),
                    )
                    .addBooleanOption(
                        localize(
                            SlashCommandBooleanOption,
                            'mentionable',
                            'role.subcommands.update.options.mentionable',
                        ),
                    )
                    .addStringOption(
                        localize(
                            SlashCommandStringOption,
                            'reason',
                            'role.subcommands.update.options.reason',
                        ),
                    ),
            )
            .addSubcommand(
                localize(SlashCommandSubcommandBuilder, 'delete', 'role.subcommands.delete')
                    .addRoleOption(
                        localize(
                            SlashCommandRoleOption,
                            'role',
                            'role.subcommands.delete.options.role',
                        ).setRequired(true),
                    )
                    .addStringOption(
                        localize(
                            SlashCommandStringOption,
                            'reason',
                            'role.subcommands.delete.options.reason',
                        ),
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
                name: name.replaceAll(
                    /([a-z])([A-Z])/gu,
                    (_, a: string, b: string) => `${a} ${b.toLowerCase()}`,
                ),
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
            throw new CommandError('Must use in guild');
        }

        switch (interaction.options.getSubcommand()) {
            case 'update':
                await this.handleUpdateSubcommand(interaction);
                break;

            case 'delete':
                await this.handleDeleteSubcommand(interaction);
                break;

            default:
                throw new CommandError(
                    `No corresponding subcommand handler found for ${inlineCode(interaction.options.getSubcommand())}.`,
                );
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
            const pattern = /^(?:#|0x)?([0-9a-fA-F]{6})$/u;
            const match = pattern.exec(colorInput);

            if (!match) {
                throw new CommandError(
                    `Invalid color. Must match ${inlineCode(pattern.toString())}`,
                );
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
            throw new CommandError('Something went wrong updating the role.');
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
        const reason = interaction.options.getString('reason') ?? undefined;

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
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
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
                    await interaction.guild.roles.delete(role.id, reason);
                } catch (error) {
                    if (!(error instanceof DiscordAPIError)) {
                        throw error;
                    }

                    await confirmInteraction.update({
                        components: [
                            new TextDisplayBuilder().setContent(
                                `Role delete failed.${error.message}`,
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
                                        '',
                                        bold('Reason'),
                                        reason,
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
