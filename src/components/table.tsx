'use client';

import { type ColumnDef, flexRender, type Table as ReactTable, type RowData } from '@tanstack/react-table';
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
}

export function Table<TData>({ table, columns }: TableProps<TData>) {
  const hasHeaders = columns.some((col) => 'header' in col && col.header);

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
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
