import NextLink from 'next/link';
import { cn } from '@/lib/shadcn-utils';

export function YearChips({ years, selectedYear }: { years: number[]; selectedYear: number }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <nav aria-label="Jahr" className="inline-flex gap-1 rounded-full border bg-card p-1 shadow-xs">
        {years.map((year) => (
          <NextLink
            key={year}
            href={`/statistics?year=${year}`}
            aria-current={year === selectedYear ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
              year === selectedYear && 'bg-primary text-primary-foreground hover:text-primary-foreground',
            )}
          >
            {year}
          </NextLink>
        ))}
      </nav>
    </div>
  );
}
