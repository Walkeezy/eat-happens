import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { HighlightCard } from '@/components/statistics/highlight-card';
import { isClosedCalendarYear, parseYearParam } from '@/lib/calendar-date';
import { buildRevealHighlights, categoryWinnerHighlights } from '@/lib/statistics';
import { verifySession } from '@/lib/verify-session';
import { getYearStatistics } from '@/services/statistics';

type Props = {
  params: Promise<{ year: string }>;
};

export default async function JahresrueckblickPage({ params }: Props) {
  const { session } = await verifySession();
  const { year: yearParam } = await params;
  const year = parseYearParam(yearParam);

  if (year === undefined || !isClosedCalendarYear(year)) {
    redirect('/statistics');
  }

  const stats = await getYearStatistics(year, session.user.id);
  const highlights = buildRevealHighlights(stats);
  const categoryWinners = categoryWinnerHighlights(stats);

  return (
    <AppLayout>
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Jahresrückblick</p>
        <h1 className="text-3xl font-bold">Rangliste {year}</h1>
      </div>

      {highlights.length === 0 ? (
        <p className="text-muted-foreground">Für {year} gibt es noch keine Rangliste.</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((card) => (
              <HighlightCard key={card.key} title={card.title} name={card.name} detail={card.detail} />
            ))}
          </div>
          {categoryWinners.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {categoryWinners.map((card) => (
                <HighlightCard key={card.key} title={card.title} name={card.name} detail={card.detail} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </AppLayout>
  );
}
