import { CommandError, GuildSlashCommand } from '@/lib/core';
import {
    actionRow,
    booleanOption,
    button,
    container,
    roleOption,
    stringOption,
    subcommand,
    textDisplay,
} from '@/lib/utils/builders';
import {
    ButtonStyle,
    Collection,
    Colors,
    DiscordAPIError,
    HeadingLevel,
    MessageFlags,
    PermissionFlagsBits,
    TimestampStyles,
    bold,
    heading,
    inlineCode,
    roleMention,
    subtext,
    time,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    type Role,
    type RoleEditOptions,
} from 'discord.js';
import { RoleService } from './RoleService';
import type { AllowedRoleProps } from './types';

export class RoleCommand extends GuildSlashCommand {
    private readonly roleService: RoleService;

    public constructor() {
        super({
            name: 'role',
            description: 'Role utility commands',
            default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
            options: [
                subcommand({
                    name: 'update',
                    description: 'Updates a role',
                    options: [
                        roleOption({
                            name: 'role',
                            description: 'The role to update',
                            required: true,
                        }),
                        stringOption({
                            name: 'name',
                            description: 'Change the name of the role',
                            max_length: 100,
                        }),
                        stringOption({
                            name: 'color',
                            description: 'Change the color of the role',
                            autocomplete: true,
                        }),
                        booleanOption({
                            name: 'hoisted',
                            description: 'Change whether the role should be hoisted or not',
                        }),
                        booleanOption({
                            name: 'mentionable',
                            description: 'Change whether the role should be mentionable or not',
                        }),
                        stringOption({
                            name: 'reason',
                            description: 'The reason for updating the role',
                        }),
                    ],
                }),
                subcommand({
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
                }),
            ],
        });

        this.roleService = new RoleService();
    }

    public override async autocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<ApplicationCommandOptionChoiceData[]> {
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

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
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
                    `No corresponding subcommand handler found for ${
                        inlineCode(
                            interaction.options.getSubcommand(),
                        )
                    }.`,
                );
        }
    }

    private async handleUpdateSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
        const role = interaction.options.getRole('role', true);

        this.roleService.validateRole(interaction, role, { allowManaged: true });

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
                container({
                    components: [
                        textDisplay({
                            content: [
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
                                    ].join(' ')
                                ),
                                '',
                                bold('Reason'),
                                reason ?? 'No reason given',
                            ].join('\n'),
                        }),
                    ],
                }),
            ],
        });
    }

    private async handleDeleteSubcommand(
        interaction: ChatInputCommandInteraction<'cached'>,
    ): Promise<void> {
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
