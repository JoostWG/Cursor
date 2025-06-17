import {
    REST,
    type RESTPostAPIBaseApplicationCommandsJSONBody,
    type RouteLike,
    Routes,
} from 'discord.js';
import { devGuildId, discordAppId, discordToken } from '../config.json';
import { createBot } from './setup';

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

    const bot = await createBot();

    const globalCommands = [];
    const devCommands = [];

    for (const command of bot.getCommands()) {
        if (command.devOnly) {
            devCommands.push(command.data);
        } else {
            globalCommands.push(command.data);
        }
    }

    if (process.argv.includes('--dev')) {
        await deploy('dev', Routes.applicationGuildCommands(discordAppId, devGuildId), devCommands);
    }

    if (process.argv.includes('--global')) {
        await deploy('dev', Routes.applicationCommands(discordAppId), globalCommands);
    }
})();
