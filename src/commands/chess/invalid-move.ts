export class InvalidMove extends Error {
    public readonly move: string;

    public constructor(move: string) {
        super(`Invalid move: ${move}`);
        this.move = move;
    }
}
