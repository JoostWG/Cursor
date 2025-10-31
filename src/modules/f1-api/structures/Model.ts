import type { Client } from '../http/Client';

export class Model<T> {
    protected constructor(protected readonly data: T, protected readonly client: Client) {
        //
    }
}
