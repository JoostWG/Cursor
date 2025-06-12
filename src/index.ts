import { discordToken } from '../config.json';
import { createClient } from './client';

(async () => {
    const client = await createClient();
    await client.login(discordToken);
})();
