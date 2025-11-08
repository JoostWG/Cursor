// TODO: Move back to core
import { Routes, type REST, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { deepEqual } from 'fast-equals';
import { devGuildId, discordAppId } from '../config.json'; // TODO: Convert to dependency
import type { CommandDataCache } from './CommandDataCache';
import type { ApplicationCommandCollection } from './lib/core';

export class CommandDeployHandler {
    public constructor(
        private readonly cache: CommandDataCache,
        private readonly api: REST,
        private readonly commands: ApplicationCommandCollection,
    ) {}

    public async deployIfNeeded(): Promise<void> {
        const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        const devCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

        for (const command of this.commands.values()) {
            if (command.devOnly) {
                devCommands.push(command.getData());
            } else {
                globalCommands.push(command.getData());
            }
        }

        const existingGlobalCommands = await this.cache.get('global');

        if (!existingGlobalCommands || !this.equal(existingGlobalCommands, globalCommands)) {
            console.info('[commands] Global command mismatch. Redeploying...');

            await this.api.put(Routes.applicationCommands(discordAppId), { body: globalCommands });

            await this.cache.set('global', globalCommands);
        }

        const existingDevCommands = await this.cache.get('dev');

        if (!existingDevCommands || !this.equal(existingDevCommands, devCommands)) {
            console.info('[commands] Dev command mismatch. Redeploying...');

            await this.api.put(Routes.applicationGuildCommands(discordAppId, devGuildId), {
                body: devCommands,
            });

            await this.cache.set('dev', devCommands);
        }
    }

    private equal<T extends RESTPostAPIApplicationCommandsJSONBody[]>(a: T, b: T): boolean {
        return deepEqual(
            Object.fromEntries(a.map((command) => [command.name, command])),
            Object.fromEntries(b.map((command) => [command.name, command])),
        );
    }
}
