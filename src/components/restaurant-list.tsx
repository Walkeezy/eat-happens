'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronRight, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RestaurantLink, restaurantHref } from '@/components/restaurant-link';
import { Input } from '@/components/shadcn/input';
import { Table } from '@/components/table';
import { displayCalendarDate } from '@/lib/calendar-date';
import { formatCurrency } from '@/lib/format';
import { filterAndSortRestaurants, type RestaurantRow, type RestaurantSort } from '@/lib/restaurants';
import { cn } from '@/lib/shadcn-utils';

const sortOptions: { value: RestaurantSort; label: string }[] = [
  { value: 'date', label: 'Neueste' },
  { value: 'rating', label: 'Bewertung' },
  { value: 'cost', label: 'Preis p.P.' },
];

const score = (value: number | undefined) => (value === undefined ? '–' : value.toFixed(1));

const columns: ColumnDef<RestaurantRow>[] = [
  {
    accessorKey: 'restaurant',
    header: 'Restaurant',
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => (
      <div className="min-w-0">
        <RestaurantLink id={row.original.id}>{row.original.restaurant}</RestaurantLink>
        <div className="text-xs text-muted-foreground">
          {displayCalendarDate(row.original.date)}
          {row.original.pickerName ? ` · ${row.original.pickerName}` : null}
          {row.original.costPerPerson === null ? null : (
            <span className="sm:hidden"> · {formatCurrency(row.original.costPerPerson)} p.P.</span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'food',
    header: 'Essen',
    meta: { className: 'hidden text-right md:table-cell' },
    cell: ({ row }) => <span className="text-muted-foreground">{score(row.original.food)}</span>,
  },
  {
    accessorKey: 'ambience',
    header: 'Ambiente',
    meta: { className: 'hidden text-right md:table-cell' },
    cell: ({ row }) => <span className="text-muted-foreground">{score(row.original.ambience)}</span>,
  },
  {
    accessorKey: 'pricePerformance',
    header: 'P/L',
    meta: { className: 'hidden text-right md:table-cell' },
    cell: ({ row }) => <span className="text-muted-foreground">{score(row.original.pricePerformance)}</span>,
  },
  {
    accessorKey: 'costPerPerson',
    header: 'p.P.',
    meta: { className: 'hidden text-right sm:table-cell' },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.costPerPerson === null ? '–' : formatCurrency(row.original.costPerPerson)}
      </span>
    ),
  },
  {
    accessorKey: 'overall',
    header: 'Ø',
    meta: { className: 'w-16 text-right' },
    cell: ({ row }) =>
      row.original.overall === undefined ? (
        <span className="text-muted-foreground">–</span>
      ) : (
        <div className="flex items-center justify-end gap-1">
          <Star className="size-3.5 fill-star text-star" />
          <span className="font-bold">{row.original.overall.toFixed(1)}</span>
        </div>
      ),
  },
  {
    id: 'open',
    header: '',
    meta: { className: 'w-6 pl-0' },
    cell: () => <ChevronRight className="size-4 text-muted-foreground" aria-hidden />,
  },
];

export function RestaurantList({ rows }: { rows: RestaurantRow[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<RestaurantSort>('date');
  const visibleRows = useMemo(() => filterAndSortRestaurants(rows, query, sort), [rows, query, sort]);
  const hiddenYear = rows.find((row) => row.ratingsHidden)?.date.slice(0, 4);

  const table = useReactTable({
    data: visibleRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
                  option.value === sort && 'bg-primary text-primary-foreground hover:text-primary-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </fieldset>
        </div>
      </div>
      <Table table={table} columns={columns} rowHref={(row) => restaurantHref(row.id)} />
      {hiddenYear ? (
        <p className="text-sm text-muted-foreground">Die Bewertungen aus {hiddenYear} gibt’s ab 1. Januar.</p>
      ) : null}
    </div>
  );
}
