export function extractHyperlinks(text: string): Iterable<string> {
    return text.matchAll(/\[([^[\]]+)\]/gmu).map((match) => match[1]);
}
