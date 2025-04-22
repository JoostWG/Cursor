import { REST, Routes } from 'discord.js';
import getCommands from './getCommands';
import { discordToken, discordAppId, devGuildId } from '../config.json';

(async () => {
    if (!discordToken || !discordAppId || !devGuildId) {
        console.error('Invalid config.');
        return;
    }

    const globalCommands = [];
    const devCommands = [];

    for await (const command of getCommands()) {
        if (command.devOnly) {
            devCommands.push(command.data.toJSON());
        } else {
            globalCommands.push(command.data.toJSON());
        }
    }

    const api = new REST().setToken(discordToken);

    if (process.argv.includes('--dev')) {
        console.info(`Syncing ${devCommands.length} dev commands`);

        const devCommandsData = await api.put(
            Routes.applicationGuildCommands(discordAppId, devGuildId),
            {
                body: devCommands,
            },
        );

        // Keep typescript happy
        if (Array.isArray(devCommandsData)) {
            console.info(`Succesfully synced ${devCommandsData.length} dev commands`);
        }
    }

    if (process.argv.includes('--global')) {
        console.info(`Syncing ${globalCommands.length} global commands`);

        const globalCommandsData = await api.put(Routes.applicationCommands(discordAppId), {
            body: globalCommands,
        });

        // Keep typescript happy
        if (Array.isArray(globalCommandsData)) {
            console.info(`Succesfully synced ${globalCommandsData.length} global commands`);
        }
    }
})();
