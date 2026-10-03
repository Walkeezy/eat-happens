import {
  ChevronLeft,
  ChevronRight,
  Crown,
  PiggyBank,
  Sparkles,
  Swords,
  ThumbsDown,
  Trophy,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/shadcn/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import { HighlightCard } from '@/components/statistics/highlight-card';
import { isClosedCalendarYear, parseYearParam } from '@/lib/calendar-date';
import { buildRevealHighlights, categoryWinnerHighlights } from '@/lib/statistics';
import { verifySession } from '@/lib/verify-session';
import { getEventYears, getYearStatistics } from '@/services/statistics';

type Props = {
  params: Promise<{ year: string }>;
};

const highlightIcons: Record<string, ReactNode> = {
  winner: <Trophy />,
  flop: <ThumbsDown />,
  expensive: <Wallet />,
  controversial: <Swords />,
  picker: <Crown />,
  food: <UtensilsCrossed />,
  ambience: <Sparkles />,
  price: <PiggyBank />,
};

export default async function JahresrueckblickPage({ params }: Props) {
  const { session } = await verifySession();
  const { year: yearParam } = await params;
  const year = parseYearParam(yearParam);

  if (year === undefined || !isClosedCalendarYear(year)) {
    redirect('/statistics');
  }

  const [stats, years] = await Promise.all([getYearStatistics(year, session.user.id), getEventYears()]);
  const highlights = buildRevealHighlights(stats);
  const categoryWinners = categoryWinnerHighlights(stats);
  const previousYear = years.includes(year - 1) ? year - 1 : undefined;
  const nextYear = isClosedCalendarYear(year + 1) && years.includes(year + 1) ? year + 1 : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Jahresrückblick"
        title={`Rangliste ${year}`}
        actions={
          <>
            <YearLink year={previousYear} label="Vorheriges Jahr">
              <ChevronLeft />
            </YearLink>
            <YearLink year={nextYear} label="Nächstes Jahr">
              <ChevronRight />
            </YearLink>
          </>
        }
      />

      {highlights.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trophy />
            </EmptyMedia>
            <EmptyTitle>Noch keine Rangliste</EmptyTitle>
            <EmptyDescription>Für {year} gibt es noch keine Rangliste.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-10">
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((card, index) => (
              <HighlightCard
                key={card.key}
                title={card.title}
                name={card.name}
                detail={card.detail}
                icon={highlightIcons[card.key]}
                variant={index === 0 && card.key === 'winner' ? 'hero' : 'default'}
                className={index === 0 && card.key === 'winner' ? 'sm:col-span-2' : undefined}
              />
            ))}
          </div>
          {categoryWinners.length > 0 ? (
            <Section title="Kategorie-Sieger">
              <div className="grid gap-3 sm:grid-cols-3">
                {categoryWinners.map((card) => (
                  <HighlightCard
                    key={card.key}
                    title={card.title}
                    name={card.name}
                    detail={card.detail}
                    icon={highlightIcons[card.key]}
                  />
                ))}
              </div>
            </Section>
          ) : null}
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <NextLink href={`/statistics?year=${year}`}>Alle Statistiken {year}</NextLink>
          </Button>
        </div>
      )}
    </>
  );
}

function YearLink({ year, label, children }: { year: number | undefined; label: string; children: ReactNode }) {
  if (year === undefined) {
    return (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {children}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" asChild>
      <NextLink href={`/jahresrueckblick/${year}`} aria-label={`${label} (${year})`}>
        {children}
      </NextLink>
    </Button>
  );
}
