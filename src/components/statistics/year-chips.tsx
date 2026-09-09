import NextLink from 'next/link';
import { Button } from '@/components/shadcn/button';

export function YearChips({ years, selectedYear }: { years: number[]; selectedYear: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {years.map((year) => (
        <Button key={year} variant={year === selectedYear ? 'default' : 'outline'} size="sm" asChild>
          <NextLink href={`/statistics?year=${year}`}>{year}</NextLink>
        </Button>
      ))}
    </div>
  );
}
