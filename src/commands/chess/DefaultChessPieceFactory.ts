import { loadImage, type Image } from 'canvas';
import type { Piece } from 'chess.js';
import path from 'path';
import type { ChessPieceFactory } from './types';

export class DefaultChessPieceFactory implements ChessPieceFactory {
    private readonly colorMap = {
        w: 'White',
        b: 'Black',
    } as const;
    private readonly pieceMap = {
        p: 'Pawn',
        n: 'Knight',
        b: 'Bishop',
        r: 'Rook',
        q: 'Queen',
        k: 'King',
    } as const;

    public constructor(private readonly dirPath: string) {}

    public async getPieceImage(piece: Piece): Promise<Image> {
        return await loadImage(
            path.join(
                __dirname,
                `${this.dirPath}/${this.colorMap[piece.color]}${this.pieceMap[piece.type]}.png`,
            ),
        );
    }
}
