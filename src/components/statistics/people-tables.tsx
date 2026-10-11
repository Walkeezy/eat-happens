import { type Column, Table } from '@/components/table';
import { cn } from '@/lib/shadcn-utils';
import type { AttendanceStat, PickCountStat, PickerBiasStat, RaterStat } from '@/lib/statistics';

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

const byUserId = (row: { userId: string }) => row.userId;

const raterColumns: Column<RaterStat>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  {
    id: 'averageGiven',
    header: 'Ø gegeben',
    cell: (row) => <span className="font-bold">{row.averageGiven.toFixed(1)}</span>,
  },
  {
    id: 'ratingCount',
    header: 'Bewertungen',
    cell: (row) => `${row.ratingCount} / ${row.attended}`,
  },
];

export function RatersTable({ rows }: { rows: RaterStat[] }) {
  return <Table rows={rows} columns={raterColumns} rowKey={byUserId} />;
}

const attendanceColumns: Column<AttendanceStat>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  {
    id: 'attended',
    header: 'Dabei',
    cell: (row) => `${row.attended} / ${row.eligible}`,
  },
  { id: 'rate', header: 'Quote', cell: (row) => `${Math.round(row.rate * 100)}%` },
];

export function AttendanceTable({ rows }: { rows: AttendanceStat[] }) {
  return <Table rows={rows} columns={attendanceColumns} rowKey={byUserId} />;
}

const pickCountColumns: Column<PickCountStat>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  { id: 'pickCount', header: 'Auswählen', cell: (row) => row.pickCount },
];

export function PickCountsTable({ rows }: { rows: PickCountStat[] }) {
  return <Table rows={rows} columns={pickCountColumns} rowKey={byUserId} />;
}

const createPickerBiasColumns = (highlightDelta: number | undefined): Column<PickerBiasStat>[] => [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  {
    id: 'pickCount',
    header: 'Auswählen',
    className: 'hidden sm:table-cell',
    cell: (row) => row.pickCount,
  },
  {
    id: 'groupAverage',
    header: 'Gruppe Ø',
    cell: (row) => row.groupAverage.toFixed(1),
  },
  {
    id: 'ownAverage',
    header: 'Eigene Ø',
    cell: (row) => row.ownAverage?.toFixed(1) ?? '-',
  },
  {
    id: 'delta',
    header: 'Δ',
    cell: (row) => {
      const isMax = highlightDelta !== undefined && row.delta === highlightDelta;

      return <span className={cn('font-bold', isMax && 'text-primary')}>{formatDelta(row.delta)}</span>;
    },
  },
];

export function PickerBiasTable({ rows }: { rows: PickerBiasStat[] }) {
  const deltas = rows.map((row) => row.delta).filter((delta): delta is number => delta !== undefined);
  const maxDelta = deltas.length > 0 ? Math.max(...deltas) : undefined;
  const columns = createPickerBiasColumns(maxDelta !== undefined && maxDelta > 0 ? maxDelta : undefined);

  return <Table rows={rows} columns={columns} rowKey={byUserId} />;
}
