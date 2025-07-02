import { range } from 'discord.js';

export interface TableCell {
    align?: 'left' | 'right';
    content: string;
}

export type TableRow =
    | (
        & { after?: string }
        & (
            | {
                cells: TableCell[];
            }
            | {
                divider: true;
            }
        )
    )
    | {
        split: true;
    };

/* eslint-disable @typescript-eslint/naming-convention */
const Corner = {
    TopLeft: '┌',
    TopRight: '┐',
    BottomLeft: '└',
    BottomRight: '┘',
};

const Line = {
    Horizontal: '─',
    Vertical: '│',
};

const CrossSection = {
    Left: '├',
    Right: '┤',
    Top: '┬',
    Bottom: '┴',
    Center: '┼',
};
/* eslint-enable @typescript-eslint/naming-convention */

export function stringTable({ rows }: { rows: TableRow[] }): string {
    const dataRows = rows.filter((row) => 'cells' in row);
    const columnCount = Math.max(...dataRows.map((row) => row.cells.length));
    const columnWidths = range(columnCount)
        .map((columnIndex) =>
            Math.max(...dataRows.map((row) => row.cells[columnIndex].content.length))
        )
        .toArray();

    return (function* _() {
        yield Corner.TopLeft;
        yield columnWidths.map((width) => Line.Horizontal.repeat(width + 2)).join(CrossSection.Top);
        yield Corner.TopRight;

        yield '\n';

        for (const row of rows) {
            if ('cells' in row) {
                yield Line.Vertical;
                yield row.cells
                    .map(
                        (cell, index) =>
                            ` ${
                                cell.content[
                                    cell.align === 'right'
                                        ? 'padStart'
                                        : 'padEnd'
                                ](
                                    columnWidths[index],
                                    ' ',
                                )
                            } `,
                    )
                    .join(Line.Vertical);
                yield Line.Vertical;
            }

            if ('divider' in row) {
                yield CrossSection.Left;
                yield columnWidths
                    .map((width) => Line.Horizontal.repeat(width + 2))
                    .join(CrossSection.Center);
                yield CrossSection.Right;
            }

            if ('split' in row) {
                yield Corner.BottomLeft;
                yield columnWidths
                    .map((width) => Line.Horizontal.repeat(width + 2))
                    .join(CrossSection.Bottom);
                yield Corner.BottomRight;

                yield '\n';

                yield Corner.TopLeft;
                yield columnWidths
                    .map((width) => Line.Horizontal.repeat(width + 2))
                    .join(CrossSection.Top);
                yield Corner.TopRight;
            }

            if ('after' in row) {
                yield ` ${row.after}`;
            }

            yield '\n';
        }

        //

        yield Corner.BottomLeft;
        yield columnWidths
            .map((width) => Line.Horizontal.repeat(width + 2))
            .join(CrossSection.Bottom);
        yield Corner.BottomRight;
    })()
        .toArray()
        .join('');
}
