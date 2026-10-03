'use client';

import { type ColumnDef, flexRender, type Table as ReactTable, type RowData } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Applied to both the header and the body cells, e.g. `hidden sm:table-cell` to drop a column on phones. */
    className?: string;
  }
}

interface TableProps<TData> {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, unknown>[];
  /**
   * Makes the whole row a click target. Keyboard, screen reader and cmd/middle-click users still need a
   * real link inside the row - this only widens the area a pointer can hit.
   */
  rowHref?: (row: TData) => string | undefined;
}

export function Table<TData>({ table, columns, rowHref }: TableProps<TData>) {
  const router = useRouter();
  const hasHeaders = columns.some((col) => 'header' in col && col.header);

  const openRow = (href: string) => (event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || target.closest('a, button')) {
      return;
    }

    router.push(href);
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs [&_td:first-child]:pl-3 [&_td:last-child]:pr-3 [&_th:first-child]:pl-3 [&_th:last-child]:pr-3">
      <ShadcnTable>
        {hasHeaders && (
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-xs text-muted-foreground ${header.column.columnDef.meta?.className ?? ''}`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const href = rowHref?.(row.original);

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={href ? openRow(href) : undefined}
                  className={href ? 'cursor-pointer' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={table.getHeaderGroups()[0].headers.length} className="h-24 text-center">
                Keine Ergebnisse.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}
