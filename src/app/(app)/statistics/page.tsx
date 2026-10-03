import { ChartNoAxesCombined } from 'lucide-react';
import { CostTable } from '@/components/cost-table';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import { CostVsPriceSection } from '@/components/statistics/cost-vs-price';
import { DisagreementTable } from '@/components/statistics/disagreement-table';
import { AttendanceTable, PickCountsTable, PickerBiasTable, RatersTable } from '@/components/statistics/people-tables';
import { type Ranking, RankingTabs } from '@/components/statistics/ranking-tabs';
import { TopLists } from '@/components/statistics/top-lists';
import { YearChips } from '@/components/statistics/year-chips';
import { YearSummaryCards } from '@/components/statistics/year-totals';
import { resolveStatisticsYear } from '@/lib/calendar-date';
import { hasYearStatisticsData, type YearStatistics } from '@/lib/statistics';
import { verifySession } from '@/lib/verify-session';
import { getEventYears, getYearStatistics } from '@/services/statistics';

type Props = {
  searchParams: Promise<{ year?: string }>;
};

/** Only the rankings that someone actually rated. */
function rankings(stats: YearStatistics): Ranking[] {
  return [
    { label: 'Gesamt', events: stats.overallRanking },
    { label: 'Essen', events: stats.categoryRankings?.food },
    { label: 'Ambiente', events: stats.categoryRankings?.ambience },
    { label: 'Preis-Leistung', events: stats.categoryRankings?.pricePerformance },
  ].filter((ranking): ranking is Ranking => ranking.events !== undefined);
}

function topListsTitle(stats: YearStatistics): string {
  if (stats.personalTop5 && stats.groupTop5) {
    return 'Deine Top 5 vs. Gruppe';
  }

  return stats.groupTop5 ? 'Gruppe Top 5' : 'Deine Top 5';
}

export default async function StatisticsPage({ searchParams }: Props) {
  const { session } = await verifySession();
  const { year: yearParam } = await searchParams;
  const years = await getEventYears();
  const year = resolveStatisticsYear(yearParam, years);
  const stats = await getYearStatistics(year, session.user.id);
  const yearRankings = rankings(stats);
  const hasTopLists = stats.personalTop5 !== undefined || stats.groupTop5 !== undefined;

  return (
    <>
      <PageHeader title="Statistiken" />
      <div className="mb-8 space-y-2">
        <YearChips years={years} selectedYear={year} />
        {stats.isClosed ? null : <p className="text-sm text-muted-foreground">Die Gruppen-Rangliste gibt’s ab 1. Januar.</p>}
      </div>

      {hasYearStatisticsData(stats) ? (
        <div className="space-y-10">
          {stats.yearTotals ? <YearSummaryCards totals={stats.yearTotals} /> : null}

          {yearRankings.length > 0 ? (
            <Section title={`Rangliste ${year}`}>
              <RankingTabs rankings={yearRankings} />
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
      )}
    </>
  );
}
