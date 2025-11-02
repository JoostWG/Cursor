import type { CircuitsResponse } from '../../http';
import { Circuit } from '../../structures';
import { DriversUrlBuilder, SeasonsUrlBuilder, TeamsUrlBuilder } from '../multiple';
import { UrlBuilder } from '../UrlBuilder';

export class CircuitUrlBuilder extends UrlBuilder<CircuitsResponse, Circuit | null> {
    public drivers(): DriversUrlBuilder {
        return this.builder(DriversUrlBuilder);
    }

    public teams(): TeamsUrlBuilder {
        return this.builder(TeamsUrlBuilder);
    }

    public seasons(): SeasonsUrlBuilder {
        return this.builder(SeasonsUrlBuilder);
    }

    protected override transformResponse(data: CircuitsResponse): Circuit | null {
        return this.transformSingle(data.MRData.CircuitTable.Circuits, Circuit);
    }
}
