import type { Api } from '../http';

export class Model<T> {
    protected constructor(protected readonly data: T, protected readonly api: Api) {
        //
    }
}
