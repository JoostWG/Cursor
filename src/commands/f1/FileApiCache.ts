import fs from 'fs/promises';
import { dirname } from 'path';
import type { ApiCache, Pagination } from '../../modules/f1-api';

export class FileApiCache implements ApiCache {
    public constructor(private readonly path: string) {
        //
    }

    public async get<T>(path: string, pagination?: Pagination): Promise<T | null> {
        try {
            const { timestamp, data } = JSON.parse(
                await fs.readFile(this.getPath(path, pagination), { encoding: 'utf-8' }),
            ) as { timestamp: number; data: T };

            // Week
            if ((Date.now() - timestamp) >= 604_800_000) {
                return null;
            }

            return data;
        } catch {
            return null;
        }
    }

    public async set(data: unknown, path: string, pagination?: Pagination): Promise<void> {
        await fs.mkdir(dirname(this.getPath(path, pagination)), { recursive: true });
        await fs.writeFile(
            this.getPath(path, pagination),
            JSON.stringify({ timestamp: Date.now(), data }),
            { encoding: 'utf-8' },
        );
    }

    private getPath(path: string, pagination?: Pagination): string {
        return `${this.path}/${this.getCacheKey(path, pagination)}.json`;
    }

    private getCacheKey(path: string, pagination?: Pagination): string {
        return path
            .split('/')
            .filter((part) => part)
            .concat([
                String(pagination?.limit ?? 'null'),
                String(pagination?.offset ?? 'null'),
            ])
            .join('-');
    }
}
