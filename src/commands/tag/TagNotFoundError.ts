import { CommandError } from '../../CommandError';

export class TagNotFoundError extends CommandError {
    public override name: string;

    public constructor(name: string) {
        super('Tag not found!');
        this.name = name;
    }
}
