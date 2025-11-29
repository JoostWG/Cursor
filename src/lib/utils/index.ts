import { AttachmentBuilder } from 'discord.js';

export type * from './types';

export function stringTitle(string: string): string {
    return string
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
