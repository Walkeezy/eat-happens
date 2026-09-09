import { cn } from '@/lib/shadcn-utils';
import type { TopRestaurant } from '@/lib/statistics';

export function TopLists({ personal, group }: { personal: TopRestaurant[]; group?: TopRestaurant[] }) {
  const groupIds = new Set(group?.map((row) => row.id));
  const personalIds = new Set(personal.map((row) => row.id));

  return (
    <div className={cn('grid gap-4', group ? 'sm:grid-cols-2' : 'sm:grid-cols-1')}>
      <TopList title="Deine Top 5" rows={personal} overlapIds={groupIds} />
      {group ? <TopList title="Gruppe Top 5" rows={group} overlapIds={personalIds} /> : null}
    </div>
  );
}

function TopList({ title, rows, overlapIds }: { title: string; rows: TopRestaurant[]; overlapIds: Set<string> }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Bewertungen.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((row, index) => (
            <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
              <span className={cn('truncate font-medium', overlapIds.has(row.id) && 'text-primary')}>
                {index + 1}. {row.restaurant}
              </span>
              <span className="font-bold">{row.score.toFixed(1)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
