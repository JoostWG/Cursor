import {
    type REST,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RouteLike,
    Routes,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
// TODO: Convert to dependency
import { devGuildId, discordAppId } from '../../config.json';
import type { CommandCollection } from './command-collection';

export class CommandDataCahce {
    public constructor(private readonly dirPath: string) {}

    public async get(key: string) {
        try {
            return JSON.parse(
                await fs.readFile(this.getPath(key), { encoding: 'utf-8' }),
            ) as RESTPostAPIApplicationCommandsJSONBody[];
        } catch {
            return null;
        }
    }

    public async set(key: string, value: RESTPostAPIApplicationCommandsJSONBody[]) {
        await fs.mkdir(path.dirname(this.getPath(key)), { recursive: true });
        await fs.writeFile(this.getPath(key), JSON.stringify(value), { encoding: 'utf-8' });
    }

    private getPath(key: string) {
        return `${this.dirPath}/${key}.json`;
    }
}

export class CommandDeployHandler {
    public constructor(
        private readonly cache: CommandDataCahce,
        private readonly api: REST,
        private readonly commands: CommandCollection,
    ) {}

    public async deployIfNeeded() {
        const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        const devCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

        for (const command of this.commands.values()) {
            if (command.devOnly) {
                devCommands.push(command.data);
            } else {
                globalCommands.push(command.data);
            }
        }

        this.log('Fetching global commands from cache...');
        const existingGlobalCommands = await this.cache.get('global');

        if (!existingGlobalCommands || !this.compare(existingGlobalCommands, globalCommands)) {
            this.log(
                'Cached commands do not match loaded commands.',
                'Sending data from loaded commands to Discord.',
            );
            await this.deploy('global', Routes.applicationCommands(discordAppId), globalCommands);
            await this.cache.set('global', globalCommands);
            this.log('Deployed global commands and updated cache.');
        } else {
            this.log('No global redeploy needed.');
        }

        this.log('Fetching dev commands from cache...');
        const existingDevCommands = await this.cache.get('dev');

        if (!existingDevCommands || !this.compare(existingDevCommands, devCommands)) {
            this.log(
                'Cached commands do not match loaded commands.',
                'Sending data from loaded commands to Discord.',
            );
            await this.deploy(
                'dev',
                Routes.applicationGuildCommands(discordAppId, devGuildId),
                devCommands,
            );
            await this.cache.set('dev', devCommands);
            this.log('Deployed dev commands and updated cache.');
        } else {
            this.log('No dev redeploy needed.');
        }
    }

    private async deploy(
        type: 'dev' | 'global',
        route: RouteLike,
        commands: RESTPostAPIApplicationCommandsJSONBody[],
    ) {
        this.log(`Syncing ${commands.length} ${type} commands`);

        const data = await this.api.put(route, { body: commands });

        if (Array.isArray(data)) {
            this.log(`Succesfully synced ${data.length} ${type} commands`);
        } else {
            console.warn(`[commands] Unexpected return value when syncing ${type} commands:`, data);
        }
    }

    private compare<T>(a: T, b: T) {
        if (a === b) {
            return true;
        }

        if (typeof a !== typeof b || a === null || b === null) {
            return false;
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }

            for (let i = 0; i < a.length; i++) {
                if (!this.compare(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        }

        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            if (keysA.length !== keysB.length) {
                return false;
            }

            for (const key of keysA) {
                if (!(key in b)) {
                    return false;
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                if (!this.compare((a as any)[key], (b as any)[key])) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    private log(...message: string[]) {
        console.info(`[commands] ${message.join(' ')}`);
    }
}
