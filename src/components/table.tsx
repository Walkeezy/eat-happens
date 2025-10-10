'use client';

import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { ColumnDef, Table as ReactTable, flexRender } from '@tanstack/react-table';

interface TableProps<TData> {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, any>[];
}

export function Table<TData>({ table }: TableProps<TData>) {
  return (
    <div className="rounded-md border bg-background">
      <ShadcnTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
