import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

export class CommandDataCache {
    public constructor(private readonly dirPath: string) {}

    public async get(key: string): Promise<RESTPostAPIApplicationCommandsJSONBody[] | null> {
        try {
            return JSON.parse(
                await fs.readFile(this.getPath(key), { encoding: 'utf-8' }),
            ) as RESTPostAPIApplicationCommandsJSONBody[];
        } catch {
            return null;
        }
    }

    public async set(key: string, value: RESTPostAPIApplicationCommandsJSONBody[]): Promise<void> {
        await fs.mkdir(path.dirname(this.getPath(key)), { recursive: true });
        await fs.writeFile(this.getPath(key), JSON.stringify(value), { encoding: 'utf-8' });
    }

    private getPath(key: string): string {
        return `${this.dirPath}/${key}.json`;
    }
}
