import type { Canvas, Image } from 'canvas';
import { createCanvas, loadImage } from 'canvas';
import type { Piece } from 'chess.js';
import { Chess } from 'chess.js';
import type {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    InteractionReplyOptions,
    Snowflake,
} from 'discord.js';
import {
    AttachmentBuilder,
    ContainerBuilder,
    HeadingLevel,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    TextDisplayBuilder,
    heading,
    subtext,
} from 'discord.js';
import path from 'path';
import { SlashCommand } from '../utils/command';

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
}

abstract class ChessPieceFactory {
    public abstract getPieceImage(piece: Piece): Promise<Canvas | Image>;
}

class CheckerboardTheme implements ChessBoardTheme {
    public constructor(
        private readonly light: ChessBoardColor,
        private readonly dark: ChessBoardColor,
    ) {}

    public squareColor(x: number, y: number) {
        return (x + y) % 2 ? this.dark : this.light;
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

    public async getPieceImage(piece: Piece) {
        return await loadImage(
            path.join(
                __dirname,
                `../../assets/chess/${this.colorMap[piece.color]}${this.pieceMap[piece.type]}.png`,
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

        ctx.beginPath();
        ctx.fillStyle = '#241302';
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill();

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
                ctx.beginPath();
                ctx.fillStyle = this.theme.squareColor(columnIndex, rowIndex);
                ctx.rect(...pos);
                ctx.fill();

                if (lastMove && lastMove.from === square) {
                    ctx.beginPath();
                    ctx.fillStyle = '#FF000033';
                    ctx.rect(...pos);
                    ctx.fill();
                }

                if (lastMove && lastMove.to === square) {
                    ctx.beginPath();
                    ctx.fillStyle = '#00FF0033';
                    ctx.rect(...pos);
                    ctx.fill();
                }

                if (cell) {
                    ctx.drawImage(await this.chessPieceFactory.getPieceImage(cell), ...pos);
                }
            }
        }

        return canvas.toBuffer('image/png');
    }
}

class InteractionHandler implements OutputHandler {
    public constructor(private readonly interaction: ChatInputCommandInteraction) {}

    public async initiate(chess: Chess, boardImageData: Buffer) {
        await this.interaction.reply(await this.buildMessage(chess, boardImageData));
    }

    public async update(chess: Chess, boardImageData: Buffer) {
        await this.interaction.editReply(await this.buildMessage(chess, boardImageData));
    }

    private async buildMessage(chess: Chess, boardImageData: Buffer) {
        const file = new AttachmentBuilder(boardImageData, { name: 'board.png' });

        let title = `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;

        if (chess.isCheckmate()) {
            title = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`;
        } else if (chess.isDraw()) {
            title = 'Draw! TODO: Display why';
        } else if (chess.isCheck()) {
            title = `Check! ${title}`;
        }

        return {
            flags: MessageFlags.IsComponentsV2,
            files: [file],
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(heading(title, HeadingLevel.Three)),
                    )
                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems(
                            new MediaGalleryItemBuilder().setURL(`attachment://${file.name}`),
                        ),
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(subtext(chess.fen())),
                    ),
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
        super('chess');
        this.games = new Map();
        this.devOnly = true;

        this.data
            .addSubcommand(
                new SlashCommandSubcommandBuilder().setName('start').setDescription('Start a game'),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('move')
                    .setDescription('Play a move')
                    .addStringOption(
                        new SlashCommandStringOption()
                            .setName('move')
                            .setDescription('Move notation')
                            .setRequired(true)
                            .setAutocomplete(true),
                    ),
            );
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

    public override async execute(interaction: ChatInputCommandInteraction) {
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
            new InteractionHandler(interaction),
            new DefaultChessBoard(
                512,
                new CheckerboardTheme('#ffcf9f', '#d28c45'),
                new DefaultChessPieceFactory(),
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
