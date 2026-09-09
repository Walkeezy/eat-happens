import { CostTable } from '@/components/cost-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { formatCurrency } from '@/lib/format';
import type { EventCostRow, YearTotals } from '@/lib/statistics';

export function YearTotalsSection({ totals, costs }: { totals: YearTotals; costs: EventCostRow[] }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Ausgaben" value={formatCurrency(totals.totalSpend)} />
        <SummaryCard title="Ø pro Person" value={formatCurrency(totals.averageCostPerPerson)} />
        <SummaryCard
          title="Teuerster Abend"
          value={totals.mostExpensive?.restaurant ?? '-'}
          detail={totals.mostExpensive ? formatCurrency(totals.mostExpensive.costPerPerson) : undefined}
        />
        <SummaryCard
          title="Günstigster Abend"
          value={totals.leastExpensive?.restaurant ?? '-'}
          detail={totals.leastExpensive ? formatCurrency(totals.leastExpensive.costPerPerson) : undefined}
        />
      </div>
      <CostTable events={costs} />
    </div>
  );
}

function SummaryCard({ title, value, detail }: { title: string; value: string; detail?: string }) {
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
