import { AppLayout } from '@/components/layout/app-layout';
import { Year2025RankingTable } from '@/components/year-2025-ranking-table';
import { verifySession } from '@/lib/verify-session';
import { get2025Ratings } from '@/services/ratings';

export default async function RankingPage() {
  await verifySession();
  const events = await get2025Ratings();

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rangliste 2025</h1>
      </div>
      <Year2025RankingTable events={events} />
    </AppLayout>
  );
}
