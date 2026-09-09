import { CostTable } from '@/components/cost-table';
import { AppLayout } from '@/components/layout/app-layout';
import { YearRankingTable } from '@/components/year-ranking-table';
import { previousCalendarYearRange } from '@/lib/calendar-date';
import { verifySession } from '@/lib/verify-session';
import { getAllEventCosts, getPreviousYearRatings } from '@/services/ratings';

export default async function StatisticsPage() {
  await verifySession();
  const { year } = previousCalendarYearRange();
  const [ratings, costs] = await Promise.all([getPreviousYearRatings(), getAllEventCosts()]);

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Rangliste {year}</h1>
      </div>
      <YearRankingTable events={ratings} />

      <div className="mt-8 mb-4">
        <h1 className="text-2xl font-bold">Kosten</h1>
      </div>
      <CostTable events={costs} />
    </AppLayout>
  );
}
