import { createCanvas, loadImage } from 'canvas';
import { Chess } from 'chess.js';
import type { AutocompleteInteraction, InteractionReplyOptions, Snowflake } from 'discord.js';
import {
    AttachmentBuilder,
    type ChatInputCommandInteraction,
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

const colorMap = {
    w: 'White',
    b: 'Black',
} as const;

const pieceMap = {
    p: 'Pawn',
    n: 'Knight',
    b: 'Bishop',
    r: 'Rook',
    q: 'Queen',
    k: 'King',
} as const;

const letterMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

class InvalidMove extends Error {
    public readonly move: string;

    public constructor(move: string) {
        super(`Invalid move: ${move}`);
        this.move = move;
    }
}

class Game {
    private readonly chess: Chess;
    private readonly interaction: ChatInputCommandInteraction;

    public constructor(interaction: ChatInputCommandInteraction) {
        this.chess = new Chess();
        this.interaction = interaction;
    }

    public async start() {
        await this.interaction.reply(await this.buildMessage());
    }

    /**
     * Perform a move and update the interaction message
     *
     * @throws {InvalidMove} If the move is invalid
     */
    public async move(move: string) {
        if (!this.chess.moves().includes(move)) {
            throw new InvalidMove(move);
        }

        this.chess.move(move);

        await this.interaction.editReply(await this.buildMessage());
    }

    public getValidMoves() {
        return this.chess.moves();
    }

    private async buildMessage() {
        const file = new AttachmentBuilder(await this.renderBoard(), { name: 'board.png' });

        let title = `${colorMap[this.chess.turn()]} to move`;

        if (this.chess.isCheckmate()) {
            title = `Checkmate! ${this.chess.turn() === 'w' ? 'Black' : 'White'} wins.`;
        } else if (this.chess.isDraw()) {
            title = 'Draw! TODO: Display why';
        } else if (this.chess.isCheck()) {
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
                        new TextDisplayBuilder().setContent(subtext(this.chess.fen())),
                    ),
            ],
        } satisfies InteractionReplyOptions;
    }

    /**
     * Render a final image buffer of the board with all pieces and other features
     */
    private async renderBoard() {
        const size = 512;
        const cellSize = size / 8;
        const borderWidth = size / 16;
        const canvas = createCanvas(size + borderWidth * 2, size + borderWidth * 2);
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fill();

        const lastMove = this.chess.history({ verbose: true }).at(-1);

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = `${borderWidth / 1.5}px Arial`;
        for (const [rowIndex, row] of this.chess.board().entries()) {
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
                        letterMap[columnIndex],
                        cellSize * columnIndex + borderWidth + cellSize / 2,
                        borderWidth / 2,
                    );

                    ctx.fillText(
                        letterMap[columnIndex],
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

                const square = `${letterMap[columnIndex]}${8 - rowIndex}`;
                ctx.beginPath();
                ctx.fillStyle = (rowIndex + columnIndex) % 2 ? 'darkgray' : 'lightgray';
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
                    ctx.drawImage(
                        await loadImage(
                            path.join(
                                __dirname,
                                `../../assets/chess/${colorMap[cell.color]}${pieceMap[cell.type]}.png`,
                            ),
                        ),
                        ...pos,
                    );
                }
            }
        }

        return canvas.toBuffer('image/png');
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

    public async autocomplete(interaction: AutocompleteInteraction) {
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
        const game = new Game(interaction);

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
