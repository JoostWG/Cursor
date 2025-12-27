import type { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import type { Chess, Piece } from 'chess.js';

export type ChessBoardColor = CanvasRenderingContext2D['fillStyle'];

export interface OutputHandler {
    initiate(chess: Chess, boardImageData: Buffer): Promise<void>;
    update(chess: Chess, boardImageData: Buffer): Promise<void>;
}

export interface ChessBoard {
    render(chess: Chess): Promise<Buffer>;
}

export interface ChessBoardTheme {
    squareColor(x: number, y: number): ChessBoardColor;
    borderColor(): ChessBoardColor;
}

export interface ChessPieceFactory {
    getPieceImage(piece: Piece): Promise<Canvas | Image>;
}

export interface MessageFactory {
    getMessage(chess: Chess): string;
}
