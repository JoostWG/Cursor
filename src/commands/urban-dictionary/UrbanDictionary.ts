import type { Api } from '@/modules/urban-dictionary';
import { HistoryItem } from './HistoryItem';
import type { InteractionHandler } from './InteractionHandler';
import type { OutputOptions } from './types';

export class UrbanDictionary {
    private readonly api: Api;
    private readonly interactionHandler: InteractionHandler;
    private readonly history: HistoryItem[];

    public constructor(api: Api, interactionHandler: InteractionHandler) {
        this.api = api;
        this.interactionHandler = interactionHandler;
        this.history = [];
    }

    public async start(term: string): Promise<void> {
        const item = await this.addHistoryItem(term);

        await this.interactionHandler.initiate({
            urbanDictionary: this,
            definition: item.getDefinition(),
            history: this.history,
            pagination: { currentPage: item.index, totalPages: item.definitions.length },
        });
    }

    public async goToDefinition(term: string): Promise<OutputOptions> {
        await this.addHistoryItem(term);

        return this.getOptions();
    }

    public async goBack(): Promise<OutputOptions> {
        this.history.pop();

        return this.getOptions();
    }

    public async previousPage(): Promise<OutputOptions> {
        const item = this.history.at(-1);

        if (item) {
            item.index--;
        }

        return this.getOptions();
    }

    public async nextPage(): Promise<OutputOptions> {
        const item = this.history.at(-1);

        if (item) {
            item.index++;
        }

        return this.getOptions();
    }

    private async addHistoryItem(term: string): Promise<HistoryItem> {
        const item = new HistoryItem(term, await this.api.define(term));

        this.history.push(item);

        return item;
    }

    private getOptions(): OutputOptions {
        const item = this.history.at(-1);

        return item
            ? {
                urbanDictionary: this,
                definition: item.getDefinition(),
                history: this.history,
                pagination: {
                    currentPage: item.index,
                    totalPages: item.definitions.length,
                },
            }
            : {
                urbanDictionary: this,
                definition: null,
                history: this.history,
                pagination: { currentPage: 0, totalPages: 0 },
            };
    }
}
