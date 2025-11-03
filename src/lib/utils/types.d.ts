export type OmitType<T extends { type?: unknown }> = Omit<T, 'type'>;

export interface SupportsJson<T = unknown> {
    toJson: () => T;
}
