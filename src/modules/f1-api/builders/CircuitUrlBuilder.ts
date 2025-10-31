import type { Api, CircuitsResponse } from '../http';
import { Circuit } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class CircuitUrlBuilder extends UrlBuilder<CircuitsResponse, Circuit | null> {
    public constructor(api: Api, private readonly id: string) {
        super(api);
    }

    protected override path(): string {
        return `/circuits/${this.id}`;
    }

    protected override transformResponse(data: CircuitsResponse): Circuit | null {
        return this.transformSingle(data.MRData.CircuitTable.Circuits, Circuit);
    }
}
