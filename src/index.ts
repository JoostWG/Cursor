import { discordToken } from '@/config';
import { createBot } from './setup';

(async () => {
    const bot = await createBot({ token: discordToken });
    await bot.run();
})();
