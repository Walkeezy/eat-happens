'use client';

import { useState } from 'react';
import { YearRankingTable } from '@/components/year-ranking-table';
import { cn } from '@/lib/shadcn-utils';
import type { RankedRestaurant } from '@/lib/statistics';

export type Ranking = {
  label: string;
  events: RankedRestaurant[];
};

/** The overall and per-category rankings list the same restaurants, so they share one table behind tabs. */
export function RankingTabs({ rankings }: { rankings: Ranking[] }) {
  const [selected, setSelected] = useState(0);
  const current = rankings[selected] ?? rankings[0];

  return (
    <div className="space-y-3">
      {rankings.length > 1 ? (
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div role="tablist" aria-label="Rangliste" className="inline-flex gap-1 rounded-full border bg-card p-1 shadow-xs">
            {rankings.map((ranking, index) => (
              <button
                key={ranking.label}
                type="button"
                role="tab"
                aria-selected={index === selected}
                onClick={() => setSelected(index)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
                  index === selected && 'bg-primary text-primary-foreground hover:text-primary-foreground',
                )}
              >
                {ranking.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div role="tabpanel">
        <YearRankingTable events={current.events} />
      </div>
    </div>
  );
}
