import { EventDialog } from '@/components/event-dialog';
import { EventsTable } from '@/components/events-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/shadcn/button';
import { verifySession } from '@/lib/verify-session';
import { getAllConfirmedUsers } from '@/services/assignments';
import { getEvents } from '@/services/events';
import { CalendarPlus } from 'lucide-react';

export default async function EventsPage() {
  const { user } = await verifySession();

  // Get events with assignments and users data server-side
  const [events, users] = await Promise.all([getEvents(user.id), getAllConfirmedUsers()]);

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <EventDialog
          mode="create"
          users={users}
          trigger={
            <Button>
              <CalendarPlus />
              Event erstellen
            </Button>
          }
        />
      </div>
      <EventsTable events={events} users={users} currentUserId={user.id} isAdmin={user.isAdmin} />
    </AppLayout>
  );
}
