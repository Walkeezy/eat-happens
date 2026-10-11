import { Star } from 'lucide-react';
import { RestaurantLink, restaurantHref } from '@/components/restaurant-link';
import { type Column, Table } from '@/components/table';
import { cn } from '@/lib/shadcn-utils';
import type { RankedRestaurant } from '@/lib/statistics';

const podiumStyles = ['bg-star/30 text-foreground', 'bg-muted-foreground/15 text-foreground', 'bg-primary/10 text-primary'];

const columns: Column<RankedRestaurant>[] = [
  {
    id: 'rank',
    header: '#',
    className: 'w-10',
    cell: (_row, index) => (
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full text-xs font-bold',
          podiumStyles[index] ?? 'text-muted-foreground',
        )}
      >
        {index + 1}
      </span>
    ),
  },
  {
    id: 'restaurant',
    header: 'Restaurant',
    className: 'whitespace-normal',
    cell: (row) => <RestaurantLink id={row.id}>{row.restaurant}</RestaurantLink>,
  },
  {
    id: 'average',
    header: 'Ø',
    cell: (row) => (
      <div className="flex items-center gap-1">
        <Star className="size-3.5 fill-star text-star" />
        <span className="font-bold">{row.average.toFixed(1)}</span>
      </div>
    ),
  },
  {
    id: 'ratingCount',
    header: 'Bewertungen',
    className: 'hidden text-right sm:table-cell',
    cell: (row) => <span className="text-muted-foreground">{row.ratingCount}</span>,
  },
];

export const YearRankingTable = ({ events }: { events: RankedRestaurant[] }) => (
  <Table rows={events} columns={columns} rowKey={(row) => row.id} rowHref={(row) => restaurantHref(row.id)} />
);
