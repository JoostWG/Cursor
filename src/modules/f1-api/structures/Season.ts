/* eslint-disable max-classes-per-file */
import type { Api, SeasonApiData } from '../http';
import { WithSeasonBuilderMethods } from '../mixins';
import { Model } from './Model';

export class Season extends WithSeasonBuilderMethods(
    class extends Model<SeasonApiData> {
        public readonly year: string;
        public readonly url: string;

        public constructor(data: SeasonApiData, api: Api) {
            super(data, api);

            this.year = data.season;
            this.url = data.url;
        }
    },
) {}
