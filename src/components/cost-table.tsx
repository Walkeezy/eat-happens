'use client';

import { Table } from '@/components/table';
import type { EventCost } from '@/services/ratings';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

export const formatCurrency = (value: number | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value);
};

const columns: ColumnDef<EventCost>[] = [
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    cell: ({ row }) => <div className="font-medium">{row.original.restaurant}</div>,
  },
  {
    accessorKey: 'totalCost',
    header: 'Gesamtkosten',
    cell: ({ row }) => formatCurrency(row.original.totalCost),
  },
  {
    accessorKey: 'attendeeCount',
    header: 'Teilnehmer',
    cell: ({ row }) => row.original.attendeeCount || '-',
  },
  {
    accessorKey: 'costPerPerson',
    header: 'Pro Person',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold">{formatCurrency(row.original.costPerPerson)}</span>
      </div>
    ),
  },
];

export const CostTable = ({ events }: { events: EventCost[] }) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
