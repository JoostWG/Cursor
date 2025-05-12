import { REST, Routes } from 'discord.js';
import { devGuildId, discordAppId, discordToken } from '../config.json';
import { getCommands, initI18Next } from './utils';

(async () => {
    if (!discordToken || !discordAppId || !devGuildId) {
        console.error('Invalid config.');
        return;
    }

    await initI18Next();

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
