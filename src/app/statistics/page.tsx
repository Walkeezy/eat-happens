import NextLink from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/shadcn/button';
import { CostVsPriceSection } from '@/components/statistics/cost-vs-price';
import { DisagreementTable } from '@/components/statistics/disagreement-table';
import {
  AttendanceTable,
  CompletionTable,
  PickCountsTable,
  PickerBiasTable,
  RatersTable,
} from '@/components/statistics/people-tables';
import { StatisticsSection } from '@/components/statistics/section';
import { TopLists } from '@/components/statistics/top-lists';
import { YearChips } from '@/components/statistics/year-chips';
import { YearTotalsSection } from '@/components/statistics/year-totals';
import { YearRankingTable } from '@/components/year-ranking-table';
import { resolveStatisticsYear } from '@/lib/calendar-date';
import { verifySession } from '@/lib/verify-session';
import { getEventYears, getYearStatistics } from '@/services/statistics';

type Props = {
  searchParams: Promise<{ year?: string }>;
};

export default async function StatisticsPage({ searchParams }: Props) {
  const { session } = await verifySession();
  const { year: yearParam } = await searchParams;
  const years = await getEventYears();
  const year = resolveStatisticsYear(yearParam, years);
  const stats = await getYearStatistics(year, session.user.id);

  return (
    <AppLayout>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Statistiken {year}</h1>
          {stats.isClosed ? (
            <Button variant="outline" size="sm" asChild>
              <NextLink href={`/jahresrueckblick/${year}`}>Jahresrückblick {year}</NextLink>
            </Button>
          ) : null}
        </div>
        <YearChips years={years} selectedYear={year} />
        {stats.isClosed ? null : <p className="text-sm text-muted-foreground">Die Gruppen-Rangliste gibt’s ab 1. Januar.</p>}
      </div>

      <div className="space-y-10">
        {stats.isClosed && stats.categoryRankings ? (
          <>
            {[
              { title: 'Bestes Essen', events: stats.categoryRankings.food },
              { title: 'Bestes Ambiente', events: stats.categoryRankings.ambience },
              { title: 'Beste Preis-Leistung', events: stats.categoryRankings.pricePerformance },
              { title: `Rangliste ${year}`, events: stats.overallRanking ?? [] },
            ].map(({ title, events: rankedEvents }) => (
              <StatisticsSection key={title} title={title}>
                <YearRankingTable events={rankedEvents} />
              </StatisticsSection>
            ))}
            {stats.costVsPricePerformance ? (
              <StatisticsSection title="Kosten vs. Preis-Leistung">
                <CostVsPriceSection
                  rows={stats.costVsPricePerformance.rows}
                  expensiveAndGood={stats.costVsPricePerformance.expensiveAndGood}
                  cheapAndDisappointing={stats.costVsPricePerformance.cheapAndDisappointing}
                />
              </StatisticsSection>
            ) : null}
          </>
        ) : null}

        <StatisticsSection title="Kosten">
          <YearTotalsSection totals={stats.yearTotals} costs={stats.costs} />
        </StatisticsSection>

        {stats.raters ? (
          <StatisticsSection title="Grosszügig vs. streng">
            <RatersTable rows={stats.raters} />
          </StatisticsSection>
        ) : null}

        <StatisticsSection title="Teilnahme">
          <AttendanceTable rows={stats.attendance} />
        </StatisticsSection>

        <StatisticsSection title="Offene Bewertungen">
          <CompletionTable rows={stats.completion} />
        </StatisticsSection>

        {stats.pickerBias && stats.pickerBias.length > 0 ? (
          <StatisticsSection title="Picker vs. Rater">
            <PickerBiasTable rows={stats.pickerBias} />
          </StatisticsSection>
        ) : (
          <StatisticsSection title="Restaurant-Auswahl">
            <PickCountsTable rows={stats.pickCounts} />
          </StatisticsSection>
        )}

        {stats.disagreement ? (
          <StatisticsSection title="Umstrittenste Dinner">
            <DisagreementTable rows={stats.disagreement} />
          </StatisticsSection>
        ) : null}

        <StatisticsSection title={stats.groupTop5 ? 'Deine Top 5 vs. Gruppe' : 'Deine Top 5'}>
          <TopLists personal={stats.personalTop5} group={stats.groupTop5} />
        </StatisticsSection>
      </div>
    </AppLayout>
  );
}
