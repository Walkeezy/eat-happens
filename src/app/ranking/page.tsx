import { AppLayout } from '@/components/layout/app-layout';
import { RankingTable } from '@/components/ranking-table';
import { getEvents } from '@/services/events';

export default async function RankingPage() {
  const events = await getEvents();

  // Sort events by average rating (descending), then by total ratings (descending) for ties
  const sortedEvents = events.sort((a, b) => {
    const avgA = a.averageRating ?? 0;
    const avgB = b.averageRating ?? 0;

    if (avgB !== avgA) {
      return avgB - avgA; // Higher average rating first
    }

    // If average ratings are equal, sort by number of ratings
    const totalA = a.totalRatings ?? 0;
    const totalB = b.totalRatings ?? 0;

    return totalB - totalA; // More ratings first
  });

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rangliste</h1>
      </div>
      <RankingTable events={sortedEvents} />
    </AppLayout>
  );
}
