import { CostTable } from '@/components/cost-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { formatCurrency } from '@/lib/format';
import type { EventCostRow, YearTotals } from '@/lib/statistics';

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

export function YearTotalsSection({ totals, costs }: { totals: YearTotals; costs: EventCostRow[] }) {
  const cards = summaries(totals);

  return (
    <div className="space-y-4">
      {cards.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <SummaryCard key={card.title} title={card.title} value={card.value} detail={card.detail} />
          ))}
        </div>
      ) : null}
      <CostTable events={costs} />
    </div>
  );
}

function SummaryCard({ title, value, detail }: Summary) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-lg">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{detail} / Person</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
