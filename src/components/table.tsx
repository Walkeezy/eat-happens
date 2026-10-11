import type { ReactNode } from 'react';
import { ClickableRow } from '@/components/clickable-row';
import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { cn } from '@/lib/shadcn-utils';

export type Column<TRow> = {
  id: string;
  header?: ReactNode;
  /** Applied to both the header and the body cells, e.g. `hidden sm:table-cell` to drop a column on phones. */
  className?: string;
  cell: (row: TRow, index: number) => ReactNode;
};

type Props<TRow> = {
  rows: TRow[];
  columns: Column<TRow>[];
  rowKey: (row: TRow) => string;
  /** Makes the whole row a click target; the row still needs a visible link for keyboard and screen reader users. */
  rowHref?: (row: TRow) => string | undefined;
};

/**
 * A plain column-to-cell renderer. The tables in this app never sort, filter or paginate through the table
 * itself, so a table library would only add bundle weight and force every table into the client bundle.
 */
export function Table<TRow>({ rows, columns, rowKey, rowHref }: Props<TRow>) {
  const hasHeaders = columns.some((column) => column.header);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs [&_td:first-child]:pl-3 [&_td:last-child]:pr-3 [&_th:first-child]:pl-3 [&_th:last-child]:pr-3">
      <ShadcnTable>
        {hasHeaders ? (
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.id} className={cn('text-xs text-muted-foreground', column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => {
              const cells = columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.cell(row, index)}
                </TableCell>
              ));
              const href = rowHref?.(row);

              return href ? (
                <ClickableRow key={rowKey(row)} href={href}>
                  {cells}
                </ClickableRow>
              ) : (
                <TableRow key={rowKey(row)}>{cells}</TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Keine Ergebnisse.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}
