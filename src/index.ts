import { discordToken } from '../config.json';
import client from './client';
import { initI18Next } from './utils';

(async () => {
    await initI18Next();
    await client.login(discordToken);
})();
