import {
    Collection,
    Colors,
    HeadingLevel,
    MessageFlags,
    bold,
    heading,
    inlineCode,
    roleMention,
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction,
    type Role,
    type RoleEditOptions,
} from 'discord.js';
import { CommandError } from '../../../CommandError';
import type { SubcommandDefinition } from '../../../lib/core';
import type { ChatInputContext } from '../../../lib/core/context';
import {
    booleanOption,
    container,
    roleOption,
    stringOption,
    textDisplay,
} from '../../../lib/utils/builders';
import type { AllowedRoleProps } from '../types';
import { RoleSubCommand } from './RoleSubcommand';

export class RoleUpdateSubcommand extends RoleSubCommand {
    protected override definition(): SubcommandDefinition {
        return {
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
        };
    }

    protected override async autocomplete(
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

    protected override async handle({ interaction }: ChatInputContext<'cached'>): Promise<void> {
        const role = interaction.options.getRole('role', true);

        this.roleService.validateRole(interaction, role, { allowManaged: true });

        const options: Partial<Pick<RoleEditOptions, AllowedRoleProps>> = {
            name: interaction.options.getString('name') ?? undefined,
            hoist: interaction.options.getBoolean('hoisted') ?? undefined,
            mentionable: interaction.options.getBoolean('mentionable') ?? undefined,
        };

        const colorInput = interaction.options.getString('color');

        if (colorInput) {
            options.colors = {
                primaryColor: this.roleService.resolveColor(colorInput),
            };
        }

        const reason = interaction.options.getString('reason') ?? undefined;

        const oldProps = new Collection<AllowedRoleProps, Role[AllowedRoleProps]>([
            ['name', role.name],
            ['colors', role.colors],
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
                                            key === 'colors' && typeof value.old === 'object'
                                                ? `#${value.old.primaryColor.toString(16)}`
                                                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                                                : value.old.toString(),
                                        ),
                                        'to',
                                        inlineCode(
                                            key === 'colors' && typeof value.new === 'object'
                                                ? `#${value.new.primaryColor.toString(16)}`
                                                // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
}
