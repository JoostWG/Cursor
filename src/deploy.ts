import {
    REST,
    type RESTPostAPIBaseApplicationCommandsJSONBody,
    type RouteLike,
    Routes,
} from 'discord.js';
import { devGuildId, discordAppId, discordToken } from '../config.json';
import { createClient } from './client';

const api = new REST().setToken(discordToken);

async function deploy(
    type: 'dev' | 'global',
    route: RouteLike,
    commands: RESTPostAPIBaseApplicationCommandsJSONBody[],
) {
    console.info(`Syncing ${commands.length} ${type} commands`);

    const data = await api.put(route, { body: commands });

    if (Array.isArray(data)) {
        console.info(`Succesfully synced ${data.length} dev commands`);
    } else {
        console.warn(`Unexpected return value when syncing ${type} commands:`, data);
    }
}

(async () => {
    if (!discordToken || !discordAppId || !devGuildId) {
        console.error('Invalid config.');
        return;
    }

    const client = await createClient();

    const globalCommands = [];
    const devCommands = [];

    for (const command of client.getAllCommands()) {
        if (command.devOnly) {
            devCommands.push(command.data.toJSON());
        } else {
            globalCommands.push(command.data.toJSON());
        }
    }

    if (process.argv.includes('--dev')) {
        await deploy('dev', Routes.applicationGuildCommands(discordAppId, devGuildId), devCommands);
    }

    if (process.argv.includes('--global')) {
        await deploy('dev', Routes.applicationCommands(discordAppId), globalCommands);
    }
})();
