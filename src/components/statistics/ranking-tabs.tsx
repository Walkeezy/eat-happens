'use client';

import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/shadcn-utils';

export type RankingTab = {
  label: string;
  /** The table, rendered on the server; this component only decides which one is visible. */
  table: ReactNode;
};

/** The overall and per-category rankings list the same restaurants, so they share one slot behind tabs. */
export function RankingTabs({ tabs }: { tabs: RankingTab[] }) {
  const [selected, setSelected] = useState(0);
  const current = tabs[selected] ?? tabs[0];

  return (
    <div className="space-y-3">
      {tabs.length > 1 ? (
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div role="tablist" aria-label="Rangliste" className="inline-flex gap-1 rounded-full border bg-card p-1 shadow-xs">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={index === selected}
                onClick={() => setSelected(index)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
                  index === selected && 'bg-primary text-primary-foreground hover:text-primary-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div role="tabpanel">{current.table}</div>
    </div>
  );
}
