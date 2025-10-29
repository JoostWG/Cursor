import type { Client } from 'discord.js';
import type { CursorDatabase } from '../../database';
import type { BaseApplicationCommand } from './command';
import type { CommandCollection } from './CommandCollection';
import type { CommandDeployHandler } from './CommandDeployHandler';
import type { EventListener } from './event-listener';

export interface BotOptions {
    client: Client;
    db: CursorDatabase;
    token: string;
    commands: CommandCollection;
    listeners?: EventListener[];
    deployHandler: CommandDeployHandler;
}

export class Bot {
    public readonly client: Client;
    public readonly db: CursorDatabase;
    private readonly token: string;
    private readonly commands: CommandCollection;
    private readonly listeners: EventListener[];
    private readonly deployHandler: CommandDeployHandler;

    public constructor(options: BotOptions) {
        this.client = options.client;
        this.db = options.db;
        this.token = options.token;
        this.commands = options.commands;
        this.deployHandler = options.deployHandler;
        this.listeners = [...this.commands.createListeners(this.db), ...(options.listeners ?? [])];

        this.client.rest.setToken(this.token);

        for (const listener of this.listeners) {
            this.client.on(listener.event, (...args) => {
                listener.handle(...args).catch(console.error);
            });
        }
    }

    public getCommands(): Iterable<BaseApplicationCommand> {
        return this.commands.values();
    }

    public async run(): Promise<void> {
        await this.deployHandler.deployIfNeeded();

        await this.client.login(this.token);
    }
}
