'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Star } from 'lucide-react';
import { Table } from '@/components/table';
import type { RankedRestaurant } from '@/lib/statistics';

const columns: ColumnDef<RankedRestaurant>[] = [
  {
    accessorKey: 'rank',
    header: '#',
    cell: ({ row }) => <span className="text-center font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    cell: ({ row }) => <div className="max-w-35 truncate font-medium">{row.original.restaurant}</div>,
  },
  {
    accessorKey: 'average',
    header: 'Ø',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold">{row.original.average.toFixed(1)}</span>
        <Star className="size-4 fill-yellow-400 text-yellow-400" />
      </div>
    ),
  },
  {
    accessorKey: 'ratingCount',
    header: 'Bewertungen',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.ratingCount}</span>,
  },
];

export const YearRankingTable = ({ events }: { events: RankedRestaurant[] }) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
