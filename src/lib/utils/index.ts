import { AttachmentBuilder } from 'discord.js';

export type * from './types';

export function searchSorted<T>(items: T[], search: string, toString: (item: T) => string): T[] {
    const searchString = search.toLowerCase();
    // eslint-disable-next-line func-style
    const toStr = (entry: T): string => toString(entry).toLowerCase();

    return items
        .filter((entry) => toStr(entry).includes(searchString))
        .toSorted((a, b) => toStr(a).indexOf(searchString) - toStr(b).indexOf(searchString));
}

export function attachment(
    content: string,
    name: string,
    options?: { encoding?: BufferEncoding },
): AttachmentBuilder {
    return new AttachmentBuilder(
        Buffer.from(content, options?.encoding ?? 'utf-8'),
        { name },
    );
}

export function jsonAttachment(
    data: unknown,
    name: string,
    options?: { encoding?: BufferEncoding },
): AttachmentBuilder {
    return attachment(JSON.stringify(data, null, '  '), name, options);
}
