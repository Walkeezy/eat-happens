'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { HighlightCard } from '@/components/statistics/highlight-card';
import { Table } from '@/components/table';
import { formatCurrency } from '@/lib/format';
import type { CostVsPriceRow } from '@/lib/statistics';

const columns: ColumnDef<CostVsPriceRow>[] = [
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    cell: ({ row }) => <div className="font-medium">{row.original.restaurant}</div>,
  },
  {
    accessorKey: 'costPerPerson',
    header: 'Pro Person',
    cell: ({ row }) => formatCurrency(row.original.costPerPerson),
  },
  {
    accessorKey: 'pricePerformance',
    header: 'Preis-Leistung',
    cell: ({ row }) => <span className="font-bold">{row.original.pricePerformance.toFixed(1)}</span>,
  },
];

export function CostVsPriceSection({
  rows,
  expensiveAndGood,
  cheapAndDisappointing,
}: {
  rows: CostVsPriceRow[];
  expensiveAndGood: CostVsPriceRow | null;
  cheapAndDisappointing: CostVsPriceRow | null;
}) {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {expensiveAndGood ? (
          <HighlightCard
            title="Teuer und gut"
            name={expensiveAndGood.restaurant}
            detail={`${formatCurrency(expensiveAndGood.costPerPerson)} / Person · PL ${expensiveAndGood.pricePerformance.toFixed(1)}`}
          />
        ) : null}
        {cheapAndDisappointing ? (
          <HighlightCard
            title="Günstig und enttäuschend"
            name={cheapAndDisappointing.restaurant}
            detail={`${formatCurrency(cheapAndDisappointing.costPerPerson)} / Person · PL ${cheapAndDisappointing.pricePerformance.toFixed(1)}`}
          />
        ) : null}
      </div>
      <Table table={table} columns={columns} />
    </div>
  );
}
