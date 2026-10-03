import { formatCurrency } from '@/lib/format';
import type { YearTotals } from '@/lib/statistics';

type Summary = {
  title: string;
  value: string;
  detail?: string;
};

/** Only the totals we can actually put a number on. */
function summaries(totals: YearTotals): Summary[] {
  const cards: Summary[] = [];

  if (totals.totalSpend !== null) {
    cards.push({ title: 'Ausgaben', value: formatCurrency(totals.totalSpend) });
  }
  if (totals.averageCostPerPerson !== null) {
    cards.push({ title: 'Ø pro Person', value: formatCurrency(totals.averageCostPerPerson) });
  }
  if (totals.mostExpensive) {
    cards.push({
      title: 'Teuerster Abend',
      value: totals.mostExpensive.restaurant,
      detail: formatCurrency(totals.mostExpensive.costPerPerson),
    });
  }
  if (totals.leastExpensive) {
    cards.push({
      title: 'Günstigster Abend',
      value: totals.leastExpensive.restaurant,
      detail: formatCurrency(totals.leastExpensive.costPerPerson),
    });
  }

  return cards;
}

export function YearSummaryCards({ totals }: { totals: YearTotals }) {
  const cards = summaries(totals);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="flex flex-col rounded-xl border bg-card p-3 shadow-xs sm:p-4">
          <p className="text-xs text-muted-foreground">{card.title}</p>
          <p className="mt-1 line-clamp-2 leading-snug font-bold">{card.value}</p>
          {card.detail ? <p className="mt-auto pt-1 text-xs text-muted-foreground">{card.detail} / Person</p> : null}
        </div>
      ))}
    </div>
  );
}
