import {
    PermissionFlagsBits,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { GuildSlashCommand, type Subcommand } from '../../lib/core';
import type { OmitType } from '../../lib/utils';
import { RoleDeleteSubcommand, RoleUpdateSubcommand } from './subcommands';

export class RoleCommand extends GuildSlashCommand {
    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'role',
            description: 'Role utility commands',
            default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
        };
    }

    protected override subcommands(): Subcommand[] {
        return [
            new RoleUpdateSubcommand(),
            new RoleDeleteSubcommand(),
        ];
    }
}
