import { cn } from '@/lib/shadcn-utils';
import type { TopRestaurant } from '@/lib/statistics';

type List = {
  title: string;
  rows: TopRestaurant[];
  overlapIds: Set<string>;
};

export function TopLists({ personal, group }: { personal?: TopRestaurant[]; group?: TopRestaurant[] }) {
  const lists: List[] = [];

  if (personal) {
    lists.push({ title: 'Deine Top 5', rows: personal, overlapIds: new Set(group?.map((row) => row.id)) });
  }
  if (group) {
    lists.push({ title: 'Gruppe Top 5', rows: group, overlapIds: new Set(personal?.map((row) => row.id)) });
  }

  return (
    <div className={cn('grid gap-4', lists.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1')}>
      {lists.map((list) => (
        <TopList key={list.title} title={list.title} rows={list.rows} overlapIds={list.overlapIds} />
      ))}
    </div>
  );
}

function TopList({ title, rows, overlapIds }: List) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h3>
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
    </div>
  );
}
