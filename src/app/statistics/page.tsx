import { CostTable } from '@/components/cost-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Year2025RankingTable } from '@/components/year-2025-ranking-table';
import { verifySession } from '@/lib/verify-session';
import { get2025Ratings, getAllEventCosts } from '@/services/ratings';

export default async function StatisticsPage() {
  await verifySession();
  const [ratings, costs] = await Promise.all([get2025Ratings(), getAllEventCosts()]);

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Rangliste 2025</h1>
      </div>
      <Year2025RankingTable events={ratings} />

      <div className="mt-8 mb-4">
        <h1 className="text-2xl font-bold">Kosten</h1>
      </div>
      <CostTable events={costs} />
    </AppLayout>
  );
}
