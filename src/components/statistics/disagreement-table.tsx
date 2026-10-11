import { RestaurantLink, restaurantHref } from '@/components/restaurant-link';
import { type Column, Table } from '@/components/table';
import type { DisagreementStat } from '@/lib/statistics';

const columns: Column<DisagreementStat>[] = [
  {
    id: 'restaurant',
    header: 'Restaurant',
    className: 'whitespace-normal',
    cell: (row) => <RestaurantLink id={row.id}>{row.restaurant}</RestaurantLink>,
  },
  {
    id: 'spread',
    header: 'Spannweite',
    cell: (row) => <span className="font-bold">{row.spread.toFixed(1)}</span>,
  },
  {
    id: 'range',
    header: 'Min–Max',
    cell: (row) => `${row.min.toFixed(1)}–${row.max.toFixed(1)}`,
  },
];

export function DisagreementTable({ rows }: { rows: DisagreementStat[] }) {
  return <Table rows={rows} columns={columns} rowKey={(row) => row.id} rowHref={(row) => restaurantHref(row.id)} />;
}
