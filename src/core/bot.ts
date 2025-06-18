import type { Client } from 'discord.js';
import type { CursorDatabase } from '../setup';
import type { CommandCollection } from './command-collection';
import type { CommandDeployHandler } from './command-deploy-handler';
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
                listener.execute(...args).catch(console.error);
            });
        }
    }

    public getCommands() {
        return this.commands.values();
    }

    public async run() {
        await this.deployHandler.deployIfNeeded();

        // await this.client.login(this.token);
    }
}
