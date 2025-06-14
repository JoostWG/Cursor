import { discordToken } from '../config.json';
import { createBot } from './setup';

(async () => {
    const bot = await createBot();
    await bot.run(discordToken);
})();
