import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BaseContext } from './BaseContext';

export class ChatInputContext<Cached extends CacheType = CacheType>
    extends BaseContext<ChatInputCommandInteraction<Cached>>
{
    //
}
