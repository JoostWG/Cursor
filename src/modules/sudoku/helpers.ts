export function arrayChunk<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
}

export function arrayZip<T>(...arrays: T[][]): T[][] {
    const minLength = Math.min(...arrays.map((arr) => arr.length));
    return Array.from({ length: minLength }, (_, i) => arrays.map((arr) => arr[i]));
}
