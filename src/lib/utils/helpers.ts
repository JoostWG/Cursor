import {
    BaseChannel,
    Role,
    User,
    channelMention,
    roleMention,
    userMention,
    type Snowflake,
} from 'discord.js';
import { RedundancyError } from '../../errors';

export type Mentionable = User | BaseChannel | Role;

export function mention(subject: User): `<@${Snowflake}>`;
export function mention(subject: BaseChannel): `<#${Snowflake}>`;
export function mention(subject: Role): `@&${Snowflake}>`;

export function mention(subject: Mentionable): string {
    if (subject instanceof User) {
        return userMention(subject.id);
    }

    if (subject instanceof BaseChannel) {
        return channelMention(subject.id);
    }

    if (subject instanceof Role) {
        return roleMention(subject.id);
    }

    throw new RedundancyError('Invalid subject type');
}
