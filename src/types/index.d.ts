type OmitType<T extends { type?: unknown }> = Omit<T, 'type'>;
