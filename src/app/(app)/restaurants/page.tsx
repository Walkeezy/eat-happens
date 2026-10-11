import { UtensilsCrossed } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { RestaurantList } from '@/components/restaurant-list';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';
import { calendarYear } from '@/lib/calendar-date';
import { verifySession } from '@/lib/verify-session';
import { getRestaurantRows } from '@/services/restaurants';

export default async function RestaurantsPage() {
  // The rows do not depend on who is asking, so the query runs while the session is being verified.
  const [, rows] = await Promise.all([verifySession(), getRestaurantRows()]);
  const firstYear = rows.length > 0 ? Math.min(...rows.map((row) => calendarYear(row.date))) : undefined;

  return (
    <>
      <PageHeader
        title="Restaurants"
        description={
          firstYear === undefined
            ? undefined
            : `${rows.length} ${rows.length === 1 ? 'Restaurant' : 'Restaurants'} seit ${firstYear}`
        }
      />

      {rows.length > 0 ? (
        <RestaurantList rows={rows} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UtensilsCrossed />
            </EmptyMedia>
            <EmptyTitle>Noch keine Restaurants</EmptyTitle>
            <EmptyDescription>Sobald das erste Dinner stattgefunden hat, taucht es hier auf.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
