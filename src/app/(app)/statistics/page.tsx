import { ChartNoAxesCombined } from 'lucide-react';
import { Suspense } from 'react';
import { CostTable } from '@/components/cost-table';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import { CostVsPriceSection } from '@/components/statistics/cost-vs-price';
import { DisagreementTable } from '@/components/statistics/disagreement-table';
import { AttendanceTable, PickCountsTable, PickerBiasTable, RatersTable } from '@/components/statistics/people-tables';
import { type RankingTab, RankingTabs } from '@/components/statistics/ranking-tabs';
import { StatisticsSkeleton } from '@/components/statistics/statistics-skeleton';
import { TopLists } from '@/components/statistics/top-lists';
import { YearChips } from '@/components/statistics/year-chips';
import { YearSummaryCards } from '@/components/statistics/year-totals';
import { YearRankingTable } from '@/components/year-ranking-table';
import { isClosedCalendarYear, parseYearParam, resolveStatisticsYear } from '@/lib/calendar-date';
import { hasYearStatisticsData, type YearStatistics } from '@/lib/statistics';
import { verifySession } from '@/lib/verify-session';
import { getEventYears, getYearStatistics } from '@/services/statistics';

type Props = {
  searchParams: Promise<{ year?: string }>;
};

/** Only the rankings that someone actually rated - rendered here, so the tabs only have to switch between them. */
function rankingTabs(stats: YearStatistics): RankingTab[] {
  return [
    { label: 'Gesamt', events: stats.overallRanking },
    { label: 'Essen', events: stats.categoryRankings?.food },
    { label: 'Ambiente', events: stats.categoryRankings?.ambience },
    { label: 'Preis-Leistung', events: stats.categoryRankings?.pricePerformance },
  ].flatMap(({ label, events }) => (events ? [{ label, table: <YearRankingTable events={events} /> }] : []));
}

function topListsTitle(stats: YearStatistics): string {
  if (stats.personalTop5 && stats.groupTop5) {
    return 'Deine Top 5 vs. Gruppe';
  }

  return stats.groupTop5 ? 'Gruppe Top 5' : 'Deine Top 5';
}

export default async function StatisticsPage({ searchParams }: Props) {
  const sessionPromise = verifySession();
  const currentUserId = sessionPromise.then(({ user }) => user.id);
  const { year: yearParam } = await searchParams;

  // Start the year's statistics right away for the year in the URL; the list of years only confirms it.
  const guessedYear = resolveStatisticsYear(yearParam, [parseYearParam(yearParam) ?? 0]);
  const guessedStats = getYearStatistics(guessedYear, currentUserId);
  // Marks the promise as handled in case the session redirects or the guess is discarded; awaiting it still throws.
  void guessedStats.catch(() => undefined);

  const [, years] = await Promise.all([sessionPromise, getEventYears()]);
  const year = resolveStatisticsYear(yearParam, years);
  const stats = year === guessedYear ? guessedStats : getYearStatistics(year, currentUserId);

  return (
    <>
      <PageHeader title="Statistiken" />
      <div className="mb-8 space-y-2">
        <YearChips years={years} selectedYear={year} />
        {isClosedCalendarYear(year) ? null : (
          <p className="text-sm text-muted-foreground">Die Gruppen-Rangliste gibt’s ab 1. Januar.</p>
        )}
      </div>

      {/* Keyed by year: switching years shows the skeleton at once instead of keeping the old year on screen. */}
      <Suspense key={year} fallback={<StatisticsSkeleton />}>
        <YearStatisticsSections year={year} stats={stats} />
      </Suspense>
    </>
  );
}

async function YearStatisticsSections({ year, stats: statsPromise }: { year: number; stats: Promise<YearStatistics> }) {
  const stats = await statsPromise;
  const yearRankings = rankingTabs(stats);
  const hasTopLists = stats.personalTop5 !== undefined || stats.groupTop5 !== undefined;

  return hasYearStatisticsData(stats) ? (
    <div className="space-y-10">
      {stats.yearTotals ? <YearSummaryCards totals={stats.yearTotals} /> : null}

      {yearRankings.length > 0 ? (
        <Section title={`Rangliste ${year}`}>
          <RankingTabs tabs={yearRankings} />
        </Section>
      ) : null}

      {hasTopLists ? (
        <Section title={topListsTitle(stats)}>
          <TopLists personal={stats.personalTop5} group={stats.groupTop5} />
        </Section>
      ) : null}

      {stats.costVsPricePerformance ? (
        <Section title="Kosten vs. Preis-Leistung">
          <CostVsPriceSection
            rows={stats.costVsPricePerformance.rows}
            expensiveAndGood={stats.costVsPricePerformance.expensiveAndGood}
            cheapAndDisappointing={stats.costVsPricePerformance.cheapAndDisappointing}
          />
        </Section>
      ) : null}

      {stats.costs ? (
        <Section title="Kosten">
          <CostTable events={stats.costs} />
        </Section>
      ) : null}

      <div className="grid gap-x-6 gap-y-10 lg:grid-cols-2">
        {stats.raters ? (
          <Section title="Grosszügig vs. streng">
            <RatersTable rows={stats.raters} />
          </Section>
        ) : null}

        {stats.attendance ? (
          <Section title="Teilnahme">
            <AttendanceTable rows={stats.attendance} />
          </Section>
        ) : null}

        {stats.pickerBias ? (
          <Section title="Picker vs. Rater">
            <PickerBiasTable rows={stats.pickerBias} />
          </Section>
        ) : null}

        {!stats.pickerBias && stats.pickCounts ? (
          <Section title="Restaurant-Auswahl">
            <PickCountsTable rows={stats.pickCounts} />
          </Section>
        ) : null}

        {stats.disagreement ? (
          <Section title="Umstrittenste Dinner">
            <DisagreementTable rows={stats.disagreement} />
          </Section>
        ) : null}
      </div>
    </div>
  ) : (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartNoAxesCombined />
        </EmptyMedia>
        <EmptyTitle>Noch keine Daten</EmptyTitle>
        <EmptyDescription>Für {year} gibt es noch keine Statistiken.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
