import { PermissionFlagsBits, type Interaction, type Role } from 'discord.js';
import { InvalidRoleError } from './InvalidRoleError';

export class RoleService {
    public validateRole(
        interaction: Interaction<'cached'>,
        role: Role,
        options?: { allowManaged?: boolean; allowEveryone?: boolean },
    ): void {
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
