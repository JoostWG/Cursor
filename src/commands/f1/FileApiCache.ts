// F1 garage doesn't have cache support yet

// import type axios from 'axios';
// import fs from 'fs/promises';
// import type { ApiCache, Pagination } from 'jolpica-f1-api';
// import { dirname } from 'path';

// export class FileApiCache implements ApiCache {
//     public constructor(private readonly path: string) {
//         //
//     }

//     public async get<T>(path: string, pagination?: Pagination): Promise<T | null> {
//         try {
//             const { timestamp, data } = JSON.parse(
//                 await fs.readFile(this.getPath(path, pagination), { encoding: 'utf-8' }),
//             ) as { timestamp: number; data: T };

//             // TODO: Cache responses that will never change forever... if possible
//             // Day
//             if ((Date.now() - timestamp) >= 86400) {
//                 return null;
//             }

//             return data;
//         } catch {
//             return null;
//         }
//     }

//     public async set(
//         data: unknown,
//         cacheControl: axios.AxiosHeaderValue | undefined,
//         path: string,
//         pagination?: Pagination,
//     ): Promise<void> {
//         await fs.mkdir(dirname(this.getPath(path, pagination)), { recursive: true });

//         await fs.writeFile(
//             this.getPath(path, pagination),
//             JSON.stringify({ timestamp: Date.now(), data }),
//             { encoding: 'utf-8' },
//         );
//     }

//     private getPath(path: string, pagination?: Pagination): string {
//         return `${this.path}/${this.getCacheKey(path, pagination)}.json`;
//     }

//     private getCacheKey(path: string, pagination?: Pagination): string {
//         return path
//             .split('/')
//             .filter((part) => part)
//             .concat([
//                 String(pagination?.limit ?? 'null'),
//                 String(pagination?.offset ?? 'null'),
//             ])
//             .join('-');
//     }
// }
