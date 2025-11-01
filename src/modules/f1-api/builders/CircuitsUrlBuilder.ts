import type { CircuitsResponse } from '../http';
import { Circuit } from '../structures';
import { UrlBuilder } from './UrlBuilder';

export class CircuitsUrlBuilder extends UrlBuilder<CircuitsResponse, Circuit[]> {
    protected override path(): string {
        return '/circuits';
    }

    protected override transformResponse(data: CircuitsResponse): Circuit[] {
        return this.transformMultiple(data.MRData.CircuitTable.Circuits, Circuit);
    }
}
