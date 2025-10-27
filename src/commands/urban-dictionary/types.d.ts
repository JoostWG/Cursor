import type { Definition } from '@/modules/urban-dictionary';
import type { HistoryItem } from './HistoryItem';
import type { UrbanDictionary } from './UrbanDictionary';

export interface Pagination {
    currentPage: number;
    totalPages: number;
}

export interface OutputOptions {
    urbanDictionary: UrbanDictionary;
    definition: Definition | null;
    history: HistoryItem[];
    pagination: Pagination;
}

export interface ComponentBuilderOptions extends OutputOptions {
    active: boolean;
}
