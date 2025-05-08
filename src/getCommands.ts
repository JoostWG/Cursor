import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import type { BaseCommand } from './utils/command';

export default async function* getCommands(dir?: string): AsyncGenerator<BaseCommand> {
    dir ??= path.join(__dirname, './commands');

    for (const dirent of await fs.readdir(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, dirent.name);

        if (dirent.isDirectory()) {
            yield* getCommands(fullPath);
        } else {
            const commandModule = await import(pathToFileURL(fullPath).href);
            const command = commandModule.default.default;

            if (command) {
                yield new command();
            }
        }
    }
}
