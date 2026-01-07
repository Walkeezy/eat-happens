'use client';

import { Table } from '@/components/table';
import type { Event2025Ranking } from '@/services/ratings';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Star } from 'lucide-react';

const columns: ColumnDef<Event2025Ranking>[] = [
  {
    accessorKey: 'rank',
    cell: ({ row }) => <span className="text-center font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: 'restaurant',
    cell: ({ row }) => <div className="max-w-35 truncate font-medium">{row.original.restaurant}</div>,
  },
  {
    accessorKey: 'averageLegacyRating',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold">{row.original.averageLegacyRating?.toFixed(1) ?? '-'}</span>
        <Star className="size-4 fill-yellow-400 text-yellow-400" />
      </div>
    ),
  },
];

export const Year2025RankingTable = ({ events }: { events: Event2025Ranking[] }) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
