/* eslint-disable @typescript-eslint/naming-convention */
import { CircuitsUrlBuilder, DriversUrlBuilder } from '../builders';
import type { Api } from '../http';
import type { Constructor } from '../types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WithSeasonBuilderMethods<
    TBase extends Constructor<{ api: Api; year: string }>,
>(Base: TBase) {
    return class HasSeasonBuilderMethods extends Base {
        public circuits(): CircuitsUrlBuilder {
            return new CircuitsUrlBuilder(this.api, { seasonYear: this.year });
        }

        public drivers(): DriversUrlBuilder {
            return new DriversUrlBuilder(this.api, { seasonYear: this.year });
        }
    };
}
