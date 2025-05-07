import { db } from './database/db';
import v1 from './database/migrations/v1';

// TODO: Make dynamic
(async () => {
    await v1.up(db);
})();
