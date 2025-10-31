import { HttpError } from './HttpError';

export class BadRequest extends HttpError {
    public constructor(public readonly detail: string) {
        super(400, detail);
    }
}
