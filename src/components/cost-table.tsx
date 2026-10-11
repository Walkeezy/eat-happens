import { RestaurantLink, restaurantHref } from '@/components/restaurant-link';
import { type Column, Table } from '@/components/table';
import { formatCurrency } from '@/lib/format';
import type { EventCostRow } from '@/lib/statistics';

const columns: Column<EventCostRow>[] = [
  {
    id: 'restaurant',
    header: 'Restaurant',
    className: 'whitespace-normal',
    cell: (row) => <RestaurantLink id={row.id}>{row.restaurant}</RestaurantLink>,
  },
  {
    id: 'totalCost',
    header: 'Gesamtkosten',
    className: 'hidden sm:table-cell',
    cell: (row) => formatCurrency(row.totalCost),
  },
  {
    id: 'attendeeCount',
    header: 'Teilnehmer',
    className: 'hidden sm:table-cell',
    cell: (row) => row.attendeeCount || '-',
  },
  {
    id: 'costPerPerson',
    header: 'Pro Person',
    cell: (row) => <span className="font-bold">{formatCurrency(row.costPerPerson)}</span>,
  },
];

export const CostTable = ({ events }: { events: EventCostRow[] }) => (
  <Table rows={events} columns={columns} rowKey={(row) => row.id} rowHref={(row) => restaurantHref(row.id)} />
);
