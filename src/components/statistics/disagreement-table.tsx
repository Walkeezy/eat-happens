'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { RestaurantLink, restaurantHref } from '@/components/restaurant-link';
import { Table } from '@/components/table';
import type { DisagreementStat } from '@/lib/statistics';

const columns: ColumnDef<DisagreementStat>[] = [
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => <RestaurantLink id={row.original.id}>{row.original.restaurant}</RestaurantLink>,
  },
  {
    accessorKey: 'spread',
    header: 'Spannweite',
    cell: ({ row }) => <span className="font-bold">{row.original.spread.toFixed(1)}</span>,
  },
  {
    accessorKey: 'range',
    header: 'Min–Max',
    cell: ({ row }) => `${row.original.min.toFixed(1)}–${row.original.max.toFixed(1)}`,
  },
];

export function DisagreementTable({ rows }: { rows: DisagreementStat[] }) {
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return <Table table={table} columns={columns} rowHref={(row) => restaurantHref(row.id)} />;
}
