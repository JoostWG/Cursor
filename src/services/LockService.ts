import {
    ChannelType,
    PermissionFlagsBits,
    TextChannel,
    type APIApplicationCommandChannelOption,
    type APIApplicationCommandRoleOption,
    type ChatInputCommandInteraction,
    type Role,
} from 'discord.js';
import { RedundancyError } from '../errors';
import { channelOption, roleOption } from '../lib/utils/builders';

export class LockService {
    // Channel

    public channelIsLocked(channel: TextChannel, role: Role): boolean {
        const overwrite = channel.permissionOverwrites.cache.get(role.id);

        if (overwrite === undefined) {
            return false;
        }

        return overwrite.deny.has(PermissionFlagsBits.SendMessages);
    }

    public channelIsUnlocked(channel: TextChannel, role: Role): boolean {
        return !this.channelIsLocked(channel, role);
    }

    public async lockChannel(channel: TextChannel, role: Role): Promise<void> {
        await channel.permissionOverwrites.edit(role, { SendMessages: false });
    }

    public async unlockChannel(channel: TextChannel, role: Role): Promise<void> {
        await channel.permissionOverwrites.edit(role, { SendMessages: null });
    }

    // Guild

    public guildIsLocked(role: Role): boolean {
        return !this.guildIsUnlocked(role);
    }

    public guildIsUnlocked(role: Role): boolean {
        return role.permissions.has(PermissionFlagsBits.SendMessages);
    }

    public async lockGuild(role: Role): Promise<void> {
        await role.setPermissions(role.permissions.remove(PermissionFlagsBits.SendMessages));
    }

    public async unlockGuild(role: Role): Promise<void> {
        await role.setPermissions(role.permissions.add(PermissionFlagsBits.SendMessages));
    }

    // Interaction options

    public getChannel(interaction: ChatInputCommandInteraction): TextChannel {
        if (!interaction.inCachedGuild()) {
            throw new RedundancyError('Must be in cached guild');
        }

        const channel = interaction.options.getChannel('channel') ?? interaction.channel;

        if (!(channel instanceof TextChannel)) {
            throw new RedundancyError('channel must be text channel');
        }

        return channel;
    }

    public getRole(interaction: ChatInputCommandInteraction): Role {
        if (!interaction.inCachedGuild()) {
            throw new RedundancyError('Must be in cached guild');
        }

        return interaction.options.getRole('role') ?? interaction.guild.roles.everyone;
    }

    public channelOption(action: 'lock' | 'unlock'): APIApplicationCommandChannelOption {
        return channelOption({
            name: 'channel',
            description: `The channel you want to ${action}. Defaults to current channel.`,
            required: false,
            channel_types: [ChannelType.GuildText],
        });
    }

    public roleOption(
        action: 'lock' | 'unlock',
        target: 'channel' | 'server',
    ): APIApplicationCommandRoleOption {
        return roleOption({
            name: 'role',
            description: `The role you want to ${action} ${target} for. Defaults to @everyone.`,
            required: false,
        });
    }
}
