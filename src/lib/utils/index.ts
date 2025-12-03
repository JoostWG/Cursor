import { AttachmentBuilder, type ApplicationCommandOptionChoiceData } from 'discord.js';

export type * from './types';

export function autocompleteResults<
    T,
>(
    search: string,
    items: T[],
    toString: (item: T) => string,
): ApplicationCommandOptionChoiceData<string>[];

// eslint-disable-next-line @typescript-eslint/max-params
export function autocompleteResults<
    T,
    R extends ApplicationCommandOptionChoiceData<string>,
>(
    search: string,
    items: T[],
    toString: (item: T) => string,
    toAutocompleteResult?: (item: T) => R,
): R[];

// eslint-disable-next-line @typescript-eslint/max-params
export function autocompleteResults<
    T,
    R extends ApplicationCommandOptionChoiceData<string>,
>(
    search: string,
    items: T[],
    toString: (item: T) => string,
    toAutocompleteResult?: (item: T) => R,
): R[] | ApplicationCommandOptionChoiceData<string>[] {
    const searchString = search.toLowerCase();
    // eslint-disable-next-line func-style
    const toStr = (item: T): string => toString(item).toLowerCase();

    return items
        .filter((item) => toStr(item).includes(searchString))
        .toSorted((a, b) => toStr(a).indexOf(searchString) - toStr(b).indexOf(searchString))
        .map(
            toAutocompleteResult
                ? (item) => toAutocompleteResult(item)
                : (item) => ({ name: toStr(item), value: toStr(item) }),
        );
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
