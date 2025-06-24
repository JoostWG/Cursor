import { Routes, type REST, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { deepEqual } from 'fast-equals';
import fs from 'fs/promises';
import path from 'path';
import { devGuildId, discordAppId } from '../../config.json'; // TODO: Convert to dependency
import type { CommandCollection } from './command-collection';

export class CommandDataCache {
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
        private readonly cache: CommandDataCache,
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

        const existingGlobalCommands = await this.cache.get('global');

        if (!existingGlobalCommands || !this.equal(existingGlobalCommands, globalCommands)) {
            console.info('[commands] Global command mismatch. Redeploying...');

            await this.api.put(
                Routes.applicationCommands(discordAppId),
                { body: globalCommands },
            );

            await this.cache.set('global', globalCommands);
        }

        const existingDevCommands = await this.cache.get('dev');

        if (!existingDevCommands || !this.equal(existingDevCommands, devCommands)) {
            console.info('[commands] Dev command mismatch. Redeploying...');

            await this.api.put(
                Routes.applicationGuildCommands(discordAppId, devGuildId),
                { body: devCommands },
            );

            await this.cache.set('dev', devCommands);
        }
    }

    private equal<T extends RESTPostAPIApplicationCommandsJSONBody[]>(a: T, b: T) {
        return deepEqual(
            Object.fromEntries(a.map((command) => [command.name, command])),
            Object.fromEntries(b.map((command) => [command.name, command])),
        );
    }
}
