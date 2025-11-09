import { CursorBot } from './CursorBot';
import { V1, V2, V3, V4 } from './database/migrations';
import { Migrator } from './database/Migrator';

(async () => {
    if (process.argv.includes('--up') && process.argv.includes('--down')) {
        console.error('Cannot use both --up and --down');
        return;
    }

    const migrator = new Migrator(
        new CursorBot('').db,
        new Map([
            ['v1', new V1()],
            ['v2', new V2()],
            ['v3', new V3()],
            ['v4', new V4()],
        ]),
    );

    if (process.argv.includes('--up')) {
        await migrator.migrate('up');
    } else if (process.argv.includes('--down')) {
        await migrator.migrate('down');
    }
})();
