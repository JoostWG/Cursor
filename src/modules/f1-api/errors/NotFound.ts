import { HttpError } from './HttpError';

export class NotFound extends HttpError {
    public constructor(message?: string) {
        super(404, message);
    }
}
