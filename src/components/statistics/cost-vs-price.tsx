import { RestaurantLink, restaurantHref } from '@/components/restaurant-link';
import { HighlightCard } from '@/components/statistics/highlight-card';
import { type Column, Table } from '@/components/table';
import { formatCurrency } from '@/lib/format';
import type { CostVsPriceRow } from '@/lib/statistics';

const columns: Column<CostVsPriceRow>[] = [
  {
    id: 'restaurant',
    header: 'Restaurant',
    className: 'whitespace-normal',
    cell: (row) => <RestaurantLink id={row.id}>{row.restaurant}</RestaurantLink>,
  },
  {
    id: 'costPerPerson',
    header: 'Pro Person',
    cell: (row) => formatCurrency(row.costPerPerson),
  },
  {
    id: 'pricePerformance',
    header: 'Preis-Leistung',
    cell: (row) => <span className="font-bold">{row.pricePerformance.toFixed(1)}</span>,
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
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {expensiveAndGood ? (
          <HighlightCard
            title="Teuer und gut"
            name={expensiveAndGood.restaurant}
            href={restaurantHref(expensiveAndGood.id)}
            detail={`${formatCurrency(expensiveAndGood.costPerPerson)} / Person · PL ${expensiveAndGood.pricePerformance.toFixed(1)}`}
          />
        ) : null}
        {cheapAndDisappointing ? (
          <HighlightCard
            title="Günstig und enttäuschend"
            name={cheapAndDisappointing.restaurant}
            href={restaurantHref(cheapAndDisappointing.id)}
            detail={`${formatCurrency(cheapAndDisappointing.costPerPerson)} / Person · PL ${cheapAndDisappointing.pricePerformance.toFixed(1)}`}
          />
        ) : null}
      </div>
      <Table rows={rows} columns={columns} rowKey={(row) => row.id} rowHref={(row) => restaurantHref(row.id)} />
    </div>
  );
}
