'use client';

import { clsx } from 'clsx';
import { Search, Star } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { ListGroup, ListRow } from '@/components/list-group';
import { restaurantHref } from '@/components/restaurant-link';
import { Input } from '@/components/shadcn/input';
import { formatCurrency } from '@/lib/format';
import { filterAndSortRestaurants, type RestaurantRow, type RestaurantSort } from '@/lib/restaurants';

const sortOptions: { value: RestaurantSort; label: string }[] = [
  { value: 'date', label: 'Neueste' },
  { value: 'rating', label: 'Bewertung' },
  { value: 'cost', label: 'Preis p.P.' },
];

const score = (value: number | undefined) => (value === undefined ? '–' : value.toFixed(1));

function RestaurantRowItem({ row }: { row: RestaurantRow }) {
  const subtitle = [
    row.displayDate,
    row.pickerName,
    row.costPerPerson === null ? null : `${formatCurrency(row.costPerPerson)} p.P.`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ListRow
      href={restaurantHref(row.id)}
      title={row.restaurant}
      subtitle={subtitle}
      trailing={
        <>
          {row.food === undefined ? null : (
            <span className="hidden text-xs text-muted-foreground lg:inline">
              Essen {score(row.food)} · Ambiente {score(row.ambience)} · P/L {score(row.pricePerformance)}
            </span>
          )}
          {row.overall === undefined ? (
            <span className="text-muted-foreground">–</span>
          ) : (
            <span className="flex items-center gap-1 font-bold">
              <Star className="size-3.5 fill-star text-star" />
              {row.overall.toFixed(1)}
            </span>
          )}
        </>
      }
    />
  );
}

export function RestaurantList({ rows }: { rows: RestaurantRow[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<RestaurantSort>('date');
  // Typing stays responsive on slow phones: the input updates at once, the filtered list catches up after.
  const deferredQuery = useDeferredValue(query);
  const visibleRows = useMemo(() => filterAndSortRestaurants(rows, deferredQuery, sort), [rows, deferredQuery, sort]);
  const hiddenYear = rows.find((row) => row.ratingsHidden)?.date.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Restaurant suchen"
            aria-label="Restaurant suchen"
            className="rounded-full bg-card pl-9"
          />
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <fieldset aria-label="Sortierung" className="inline-flex gap-1 rounded-full border bg-card p-1 shadow-xs">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={option.value === sort}
                onClick={() => setSort(option.value)}
                className={clsx(
                  'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                  option.value === sort
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </fieldset>
        </div>
      </div>
      <ListGroup>
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => <RestaurantRowItem key={row.id} row={row} />)
        ) : (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">Keine Ergebnisse.</li>
        )}
      </ListGroup>
      {hiddenYear ? (
        <p className="text-sm text-muted-foreground">Die Bewertungen aus {hiddenYear} gibt’s ab 1. Januar.</p>
      ) : null}
    </div>
  );
}
