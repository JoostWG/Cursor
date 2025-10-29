import { discordToken } from '../config.json';
import { createBot } from './setup';

(async () => {
    const bot = await createBot({ token: discordToken });
    await bot.run();
})();
