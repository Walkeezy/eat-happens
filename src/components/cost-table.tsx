'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table } from '@/components/table';
import { formatCurrency } from '@/lib/format';
import type { EventCostRow } from '@/lib/statistics';

const columns: ColumnDef<EventCostRow>[] = [
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => <div className="font-medium">{row.original.restaurant}</div>,
  },
  {
    accessorKey: 'totalCost',
    header: 'Gesamtkosten',
    meta: { className: 'hidden sm:table-cell' },
    cell: ({ row }) => formatCurrency(row.original.totalCost),
  },
  {
    accessorKey: 'attendeeCount',
    header: 'Teilnehmer',
    meta: { className: 'hidden sm:table-cell' },
    cell: ({ row }) => row.original.attendeeCount || '-',
  },
  {
    accessorKey: 'costPerPerson',
    header: 'Pro Person',
    cell: ({ row }) => <span className="font-bold">{formatCurrency(row.original.costPerPerson)}</span>,
  },
];

export const CostTable = ({ events }: { events: EventCostRow[] }) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
