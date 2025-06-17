import {
    type Canvas,
    type CanvasRenderingContext2D,
    type Image,
    createCanvas,
    loadImage,
} from 'canvas';
import { Chess, type Piece } from 'chess.js';
import {
    AttachmentBuilder,
    type AutocompleteInteraction,
    type ChatInputCommandInteraction,
    HeadingLevel,
    type InteractionReplyOptions,
    MessageFlags,
    type Snowflake,
    heading,
} from 'discord.js';
import path from 'path';
import { SlashCommand } from '../core/command';
import type { ChatInputContext } from '../core/context';
import { stringOption, subcommand } from '../utils/command-options';
import { container, mediaGallery, textDisplay } from '../utils/components';

type ChessBoardColor = CanvasRenderingContext2D['fillStyle'];

abstract class OutputHandler {
    public abstract initiate(chess: Chess, boardImageData: Buffer): Promise<void>;
    public abstract update(chess: Chess, boardImageData: Buffer): Promise<void>;
}

abstract class ChessBoard {
    public abstract render(chess: Chess): Promise<Buffer>;
}

abstract class ChessBoardTheme {
    public abstract squareColor(x: number, y: number): ChessBoardColor;
    public abstract borderColor(): ChessBoardColor;
}

abstract class ChessPieceFactory {
    public abstract getPieceImage(piece: Piece): Promise<Canvas | Image>;
}

abstract class MessageFactory {
    public abstract getMessage(chess: Chess): string;
}

class CheckerboardTheme implements ChessBoardTheme {
    public constructor(
        private readonly colors: {
            light: ChessBoardColor;
            dark: ChessBoardColor;
            border: ChessBoardColor;
        },
    ) {}

    public squareColor(x: number, y: number) {
        return (x + y) % 2 ? this.colors.dark : this.colors.light;
    }

    public borderColor() {
        return this.colors.border;
    }
}

class DefaultChessPieceFactory implements ChessPieceFactory {
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

    public async getPieceImage(piece: Piece) {
        return await loadImage(
            path.join(
                __dirname,
                `${this.dirPath}/${this.colorMap[piece.color]}${this.pieceMap[piece.type]}.png`,
            ),
        );
    }
}

class DefaultChessBoard implements ChessBoard {
    private readonly letterMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

    public constructor(
        private readonly size: number,
        private readonly theme: ChessBoardTheme,
        private readonly chessPieceFactory: ChessPieceFactory,
    ) {}

    public async render(chess: Chess) {
        const cellSize = this.size / 8;
        const borderWidth = this.size / 16;
        const canvas = createCanvas(this.size + borderWidth * 2, this.size + borderWidth * 2);
        const ctx = canvas.getContext('2d');

        this.drawSquare(ctx, this.theme.borderColor(), 0, 0, canvas.width, canvas.height);

        const lastMove = chess.history({ verbose: true }).at(-1);

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = `${borderWidth / 1.5}px Arial`;

        for (const [rowIndex, row] of chess.board().entries()) {
            ctx.fillStyle = 'white';

            ctx.fillText(
                (8 - rowIndex).toString(),
                borderWidth / 2,
                cellSize * rowIndex + borderWidth + cellSize / 2,
            );

            ctx.fillText(
                (8 - rowIndex).toString(),
                canvas.height - borderWidth / 2,
                cellSize * rowIndex + borderWidth + cellSize / 2,
            );

            for (const [columnIndex, cell] of row.entries()) {
                ctx.fillStyle = 'white';

                if (rowIndex === 0) {
                    ctx.fillText(
                        this.letterMap[columnIndex],
                        cellSize * columnIndex + borderWidth + cellSize / 2,
                        borderWidth / 2,
                    );

                    ctx.fillText(
                        this.letterMap[columnIndex],
                        cellSize * columnIndex + borderWidth + cellSize / 2,
                        canvas.width - borderWidth / 2,
                    );
                }

                const pos = [
                    cellSize * columnIndex + borderWidth,
                    cellSize * rowIndex + borderWidth,
                    cellSize,
                    cellSize,
                ] as const;

                const square = `${this.letterMap[columnIndex]}${8 - rowIndex}`;

                this.drawSquare(ctx, this.theme.squareColor(columnIndex, rowIndex), ...pos);

                if (lastMove && lastMove.from === square) {
                    this.drawSquare(ctx, '#FF000033', ...pos);
                }

                if (lastMove && lastMove.to === square) {
                    this.drawSquare(ctx, '#00FF0033', ...pos);
                }

                if (cell) {
                    ctx.drawImage(await this.chessPieceFactory.getPieceImage(cell), ...pos);
                }
            }
        }

        return canvas.toBuffer('image/png');
    }

    private drawSquare(
        ctx: CanvasRenderingContext2D,
        fillStyle: CanvasRenderingContext2D['fillStyle'],
        ...args: Parameters<CanvasRenderingContext2D['rect']>
    ) {
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.rect(...args);
        ctx.fill();
    }
}

class DefaultMessageFactory implements MessageFactory {
    public getMessage(chess: Chess) {
        const title = `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;

        if (chess.isCheckmate()) {
            return `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`;
        } else if (chess.isDraw()) {
            return 'Draw! TODO: Display why';
        } else if (chess.isCheck()) {
            return `Check! ${title}`;
        }

        return title;
    }
}

class InteractionHandler implements OutputHandler {
    public constructor(
        private readonly interaction: ChatInputCommandInteraction,
        private readonly messageFactory: MessageFactory,
    ) {}

    public async initiate(chess: Chess, boardImageData: Buffer) {
        await this.interaction.reply(await this.buildMessage(chess, boardImageData));
    }

    public async update(chess: Chess, boardImageData: Buffer) {
        await this.interaction.editReply(await this.buildMessage(chess, boardImageData));
    }

    private async buildMessage(chess: Chess, boardImageData: Buffer) {
        const file = new AttachmentBuilder(boardImageData, { name: 'board.png' });

        return {
            flags: MessageFlags.IsComponentsV2,
            files: [file],
            components: [
                container({
                    components: [
                        textDisplay({
                            content: heading(
                                this.messageFactory.getMessage(chess),
                                HeadingLevel.Three,
                            ),
                        }),
                        mediaGallery({
                            items: [{ media: { url: `attachment://${file.name}` } }],
                        }),
                        textDisplay({
                            content: chess.fen(),
                        }),
                    ],
                }),
            ],
        } satisfies InteractionReplyOptions;
    }
}

class InvalidMove extends Error {
    public readonly move: string;

    public constructor(move: string) {
        super(`Invalid move: ${move}`);
        this.move = move;
    }
}

class Game {
    public constructor(
        private readonly chess: Chess,
        private readonly output: OutputHandler,
        private readonly board: ChessBoard,
    ) {}

    public async start() {
        await this.output.initiate(this.chess, await this.board.render(this.chess));
    }

    public async move(move: string) {
        if (!this.chess.moves().includes(move)) {
            throw new InvalidMove(move);
        }

        this.chess.move(move);

        await this.output.update(this.chess, await this.board.render(this.chess));
    }

    public getValidMoves() {
        return this.chess.moves();
    }
}

export default class ChessCommand extends SlashCommand {
    private readonly games: Map<Snowflake, Game>;

    public constructor() {
        super({
            name: 'chess',
            description: 'Play some chess!',
            options: [
                subcommand({
                    name: 'start',
                    description: 'Start a game',
                }),
                subcommand({
                    name: 'move',
                    description: 'Play a move',
                    options: [
                        stringOption({
                            name: 'move',
                            description: 'Move notation',
                            required: true,
                            autocomplete: true,
                        }),
                    ],
                }),
            ],
        });

        this.games = new Map();
        this.devOnly = true;
    }

    public override async autocomplete(interaction: AutocompleteInteraction) {
        const game = this.games.get(interaction.user.id);

        if (!game) {
            return [];
        }

        const q = interaction.options.getFocused();

        return game
            .getValidMoves()
            .filter((move) => move.includes(q))
            .map((move) => ({ name: move, value: move }));
    }

    public override async execute({ interaction }: ChatInputContext) {
        switch (interaction.options.getSubcommand()) {
            case 'start':
                await this.handleStart(interaction);
                break;

            case 'move':
                await this.handleMove(interaction);
                break;
        }
    }

    private async handleStart(interaction: ChatInputCommandInteraction) {
        const game = new Game(
            new Chess(),
            new InteractionHandler(interaction, new DefaultMessageFactory()),
            new DefaultChessBoard(
                512,
                new CheckerboardTheme({ light: '#ffcf9f', dark: '#d28c45', border: '#241302' }),
                new DefaultChessPieceFactory('../../assets/chess'),
            ),
        );

        this.games.set(interaction.user.id, game);

        await game.start();
    }

    private async handleMove(interaction: ChatInputCommandInteraction) {
        const game = this.games.get(interaction.user.id);
        const move = interaction.options.getString('move', true);

        if (!game) {
            await interaction.reply({
                flags: MessageFlags.Ephemeral,
                content: 'No game found',
            });
            return;
        }

        if (game.getValidMoves().includes(move)) {
            await Promise.all([
                game.move(move),
                interaction.reply({
                    flags: MessageFlags.Ephemeral,
                    content: 'Moving...',
                }),
            ]);
        } else {
            await interaction.reply({
                flags: MessageFlags.Ephemeral,
                content: 'Invalid move',
            });
        }

        await interaction.deleteReply();
    }
}
