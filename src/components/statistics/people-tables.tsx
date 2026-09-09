'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table } from '@/components/table';
import { cn } from '@/lib/shadcn-utils';
import type { AttendanceStat, CompletionStat, PickCountStat, PickerBiasStat, RaterStat } from '@/lib/statistics';

function StatTable<T>({ rows, columns }: { rows: T[]; columns: ColumnDef<T>[] }) {
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return <Table table={table} columns={columns} />;
}

function formatDelta(delta: number | undefined): string {
  if (delta === undefined) {
    return '-';
  }

  const formatted = Math.abs(delta).toFixed(1);
  if (delta > 0) {
    return `+${formatted}`;
  }
  if (delta < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

const raterColumns: ColumnDef<RaterStat>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => row.original.name },
  {
    accessorKey: 'averageGiven',
    header: 'Ø gegeben',
    cell: ({ row }) => <span className="font-bold">{row.original.averageGiven.toFixed(1)}</span>,
  },
  { accessorKey: 'ratingCount', header: 'Bewertungen', cell: ({ row }) => row.original.ratingCount },
];

export function RatersTable({ rows }: { rows: RaterStat[] }) {
  return <StatTable rows={rows} columns={raterColumns} />;
}

const attendanceColumns: ColumnDef<AttendanceStat>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => row.original.name },
  {
    accessorKey: 'attended',
    header: 'Dabei',
    cell: ({ row }) => `${row.original.attended} / ${row.original.eligible}`,
  },
  { accessorKey: 'rate', header: 'Quote', cell: ({ row }) => `${Math.round(row.original.rate * 100)}%` },
];

export function AttendanceTable({ rows }: { rows: AttendanceStat[] }) {
  return <StatTable rows={rows} columns={attendanceColumns} />;
}

const completionColumns: ColumnDef<CompletionStat>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => row.original.name },
  { accessorKey: 'open', header: 'Offen', cell: ({ row }) => <span className="font-bold">{row.original.open}</span> },
  { accessorKey: 'rated', header: 'Bewertet', cell: ({ row }) => `${row.original.rated} / ${row.original.assigned}` },
];

export function CompletionTable({ rows }: { rows: CompletionStat[] }) {
  return <StatTable rows={rows} columns={completionColumns} />;
}

const pickCountColumns: ColumnDef<PickCountStat>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => row.original.name },
  { accessorKey: 'pickCount', header: 'Auswählen', cell: ({ row }) => row.original.pickCount },
];

export function PickCountsTable({ rows }: { rows: PickCountStat[] }) {
  return <StatTable rows={rows} columns={pickCountColumns} />;
}

const pickerBiasColumns: ColumnDef<PickerBiasStat>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => row.original.name },
  { accessorKey: 'pickCount', header: 'Auswählen', cell: ({ row }) => row.original.pickCount },
  {
    accessorKey: 'groupAverage',
    header: 'Gruppe Ø',
    cell: ({ row }) => row.original.groupAverage.toFixed(1),
  },
  {
    accessorKey: 'ownAverage',
    header: 'Eigene Ø',
    cell: ({ row }) => row.original.ownAverage?.toFixed(1) ?? '-',
  },
  {
    accessorKey: 'delta',
    header: 'Δ',
    cell: ({ row, table }) => {
      const deltas = table
        .getRowModel()
        .rows.map((item) => item.original.delta)
        .filter((delta): delta is number => delta !== undefined);
      const maxDelta = deltas.length > 0 ? Math.max(...deltas) : undefined;
      const isMax = maxDelta !== undefined && row.original.delta === maxDelta && maxDelta > 0;

      return <span className={cn('font-bold', isMax && 'text-primary')}>{formatDelta(row.original.delta)}</span>;
    },
  },
];

export function PickerBiasTable({ rows }: { rows: PickerBiasStat[] }) {
  return <StatTable rows={rows} columns={pickerBiasColumns} />;
}
