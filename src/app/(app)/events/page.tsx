import { CalendarPlus } from 'lucide-react';
import { EventDialog } from '@/components/event-dialog';
import { EventsTable } from '@/components/events-table';
import { AdminTabs } from '@/components/layout/admin-tabs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/shadcn/button';
import { requireAdminPage } from '@/lib/verify-session';
import { getAllConfirmedUsers } from '@/services/assignments';
import { getEvents } from '@/services/events';

export default async function EventsPage() {
  const { user } = await requireAdminPage();

  // Get events with assignments and users data server-side
  const [events, users] = await Promise.all([getEvents(), getAllConfirmedUsers()]);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Events"
        description={`${events.length} Dinner erfasst`}
        actions={
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
        }
      />
      <AdminTabs />
      <EventsTable events={events} users={users} isAdmin={user.isAdmin} />
    </>
  );
}
