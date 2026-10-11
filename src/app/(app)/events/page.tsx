import { CalendarPlus } from 'lucide-react';
import { EventDialog } from '@/components/event-dialog';
import { type AdminEventRow, EventsTable } from '@/components/events-table';
import { AdminTabs } from '@/components/layout/admin-tabs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/shadcn/button';
import { displayCalendarDate, todayCalendarDate } from '@/lib/calendar-date';
import { displayName } from '@/lib/user';
import { requireAdminPage } from '@/lib/verify-session';
import { getAllConfirmedUsers } from '@/services/assignments';
import { getEvents } from '@/services/events';

export default async function EventsPage() {
  // Neither query depends on who is asking, so they run while the session is being verified.
  const [, events, confirmedUsers] = await Promise.all([
    requireAdminPage(),
    getEvents({ shape: 'admin' }),
    getAllConfirmedUsers(),
  ]);
  const today = todayCalendarDate();

  // One object per guest, shared by every dinner they attended, so the RSC payload serialises each person once.
  type Guest = AdminEventRow['assignedUsers'][number];
  const guests = new Map<string, Guest>();
  const guest = ({ id, name, firstName, email, image }: Guest): Guest => {
    const existing = guests.get(id);
    if (existing) {
      return existing;
    }

    const created = { id, name, firstName, email, image: image ?? null };
    guests.set(id, created);
    return created;
  };

  // The table and its dialogs are client components - hand them only the fields they render.
  const rows: AdminEventRow[] = events.map((event) => ({
    id: event.id,
    restaurant: event.restaurant,
    date: event.date,
    displayDate: displayCalendarDate(event.date),
    totalCost: event.totalCost,
    pickedByUserId: event.pickedByUserId,
    pickerName: event.pickedByUser ? displayName(event.pickedByUser) : null,
    isPast: event.date <= today,
    assignedUsers: (event.assignedUsers ?? []).map((user) => guest({ ...user, image: user.image ?? null })),
  }));
  const users = confirmedUsers.map(({ id, name, firstName, email }) => ({ id, name, firstName, email }));

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
      <EventsTable events={rows} users={users} />
    </>
  );
}
