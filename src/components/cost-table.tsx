'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table } from '@/components/table';
import { formatCurrency } from '@/lib/format';
import type { EventCostRow } from '@/lib/statistics';

const columns: ColumnDef<EventCostRow>[] = [
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

export const CostTable = ({ events }: { events: EventCostRow[] }) => {
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
