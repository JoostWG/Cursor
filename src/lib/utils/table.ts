import { range } from 'discord.js';
import type { Stringable } from './types';

export interface TableCell {
    align?: 'left' | 'right';
    content: string;
}

export interface TableCells {
    cells: TableCell[];
    after?: string;
}

export interface TableDivider {
    divider: true;
    after?: string;
}

export interface TableSplit {
    split: true;
}

export interface Column<T> {
    name: string;
    options?: Omit<TableCell, 'content'>;
    value(row: T): Stringable;
}

export type TableRow = TableCells | TableDivider | TableSplit;

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

export class Table {
    private readonly columnWidths: number[];

    public constructor(private readonly rows: TableRow[]) {
        const dataRows = this.rows.filter((row) => 'cells' in row);

        this.columnWidths = range(Math.max(...dataRows.map((row) => row.cells.length)))
            .map((columnIndex) =>
                Math.max(...dataRows.map((row) => row.cells[columnIndex].content.length))
            )
            .toArray();
    }

    public static build<T>(rows: T[], columns: Column<T>[]): Table {
        return new this([
            this.row(columns.map((column) => this.cell(column.name, column.options))),
            this.divider(),
            ...rows.map((row) =>
                this.row(columns.map((column) => this.cell(column.value(row), column.options)))
            ),
        ]);
    }

    public static cell(content: Stringable, options?: Omit<TableCell, 'content'>): TableCell {
        return { content: content.toString(), ...(options ?? {}) };
    }

    public static row(cells: TableCell[], options?: Omit<TableCells, 'cells'>): TableCells {
        return { cells, ...(options ?? {}) };
    }

    public static divider(options?: Omit<TableDivider, 'divider'>): TableDivider {
        return { divider: true, ...(options ?? {}) };
    }

    public static split(): TableSplit {
        return { split: true };
    }

    public render(): string {
        return [
            this.tableTop(),
            ...this.rows.flatMap((row) => {
                if ('cells' in row) {
                    return this.tableCells(row.cells, { after: row.after });
                }

                if ('divider' in row) {
                    return this.tableDivider({ after: row.after });
                }

                if ('split' in row) {
                    return this.tableSplit();
                }

                return [];
            }),
            this.tableBottom(),
        ].join('\n');
    }

    private tableTop(): string {
        return [
            Corner.TopLeft,
            this.columnWidths.map((width) => Line.Horizontal.repeat(width + 2)).join(
                CrossSection.Top,
            ),
            Corner.TopRight,
        ].join('');
    }

    private tableBottom(): string {
        return [
            Corner.BottomLeft,
            this.columnWidths.map((width) => Line.Horizontal.repeat(width + 2)).join(
                CrossSection.Bottom,
            ),
            Corner.BottomRight,
        ].join('');
    }

    private tableCells(cells: TableCell[], options?: { after?: string }): string {
        return [
            Line.Vertical,
            cells
                .map(
                    (cell, index) =>
                        ` ${
                            cell.content[
                                cell.align === 'right'
                                    ? 'padStart'
                                    : 'padEnd'
                            ](
                                this.columnWidths[index],
                                ' ',
                            )
                        } `,
                )
                .join(Line.Vertical),
            Line.Vertical,
            options?.after ? ` ${options.after}` : '',
        ].join('');
    }

    private tableDivider(options?: { after?: string }): string {
        return [
            CrossSection.Left,
            this.columnWidths
                .map((width) => Line.Horizontal.repeat(width + 2))
                .join(CrossSection.Center),
            CrossSection.Right,
            options?.after ? ` ${options.after}` : '',
        ].join('');
    }

    private tableSplit(): string[] {
        return [this.tableBottom(), this.tableTop()];
    }
}
