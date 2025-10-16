import type { Definition } from '../../modules/urban-dictionary';
import type { HistoryItem } from './history-item';
import type { UrbanDictionary } from './urban-dictionary';

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
