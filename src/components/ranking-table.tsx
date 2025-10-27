'use client';

import { Table } from '@/components/table';
import type { EventWithDetails } from '@/types/events';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Star } from 'lucide-react';

type Props = {
  events: EventWithDetails[];
  hideRatings: boolean;
};

export const RankingTable = ({ events, hideRatings }: Props) => {
  const columns: ColumnDef<EventWithDetails>[] = [
    {
      accessorKey: 'restaurant',
      header: 'Restaurant',
      cell: ({ row }) => <div className="font-medium">{row.original.restaurant}</div>,
    },
    {
      accessorKey: hideRatings ? 'totalRatings' : 'averageRating',
      header: hideRatings ? 'Anzahl Bewertungen' : 'Bewertung',
      cell: ({ row }) =>
        hideRatings ? (
          <div className="font-bold">{row.original.totalRatings ?? 0}</div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold">{row.original.averageRating!.toFixed(1)}</span>
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
          </div>
        ),
    },
  ];

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
