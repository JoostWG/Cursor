import type { CommandInteraction } from 'discord.js';

export class Context<T extends CommandInteraction> {
    public constructor(public readonly interaction: T) {}
}
