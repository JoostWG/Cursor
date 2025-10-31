import type { Api } from '../http/Api';

export class Model<T> {
    protected constructor(protected readonly data: T, public readonly api: Api) {
        //
    }
}
