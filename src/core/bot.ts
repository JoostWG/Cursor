import type { Client } from 'discord.js';
import type { CursorDatabase } from '../setup';
import type { CommandCollection } from './command-collection';
import type { EventListener } from './event-listener';

export interface BotOptions {
    client: Client;
    db: CursorDatabase;
    commands: CommandCollection;
    listeners?: EventListener[];
}

export class Bot {
    public readonly client: Client;
    public readonly db: CursorDatabase;
    private readonly commandMap: CommandCollection;
    private readonly listeners: EventListener[];

    public constructor(options: BotOptions) {
        this.client = options.client;
        this.db = options.db;
        this.commandMap = options.commands;
        this.listeners = [
            ...this.commandMap.createListeners(this.db),
            ...(options.listeners ?? []),
        ];

        for (const listener of this.listeners) {
            this.client.on(listener.event, (...args) => {
                listener.execute(...args).catch(console.error);
            });
        }
    }

    public getCommands() {
        return this.commandMap.values();
    }

    public async run(token: string) {
        await this.client.login(token);
    }
}
