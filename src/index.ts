import { discordToken } from '../config.json';
import { CursorBot } from './CursorBot';

(async () => {
    const bot = new CursorBot(discordToken);

    await bot.start();
})();
