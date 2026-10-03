'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Star } from 'lucide-react';
import { Table } from '@/components/table';
import { cn } from '@/lib/shadcn-utils';
import type { RankedRestaurant } from '@/lib/statistics';

const podiumStyles = ['bg-star/30 text-foreground', 'bg-muted-foreground/15 text-foreground', 'bg-primary/10 text-primary'];

const columns: ColumnDef<RankedRestaurant>[] = [
  {
    accessorKey: 'rank',
    header: '#',
    meta: { className: 'w-10' },
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full text-xs font-bold',
          podiumStyles[row.index] ?? 'text-muted-foreground',
        )}
      >
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => <div className="font-medium">{row.original.restaurant}</div>,
  },
  {
    accessorKey: 'average',
    header: 'Ø',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="size-3.5 fill-star text-star" />
        <span className="font-bold">{row.original.average.toFixed(1)}</span>
      </div>
    ),
  },
  {
    accessorKey: 'ratingCount',
    header: 'Bewertungen',
    meta: { className: 'hidden text-right sm:table-cell' },
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
