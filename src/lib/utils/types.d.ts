export type OmitType<T extends { type?: unknown }> = Omit<T, 'type'>;

export interface Stringable {
    toString: () => string;
}
