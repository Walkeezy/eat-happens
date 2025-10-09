import { CreateEventDialog } from '@/components/create-event-dialog';
import { EventsTable } from '@/components/events-table';
import { auth } from '@/lib/auth';
import { getEvents } from '@/services/events';
import { CalendarDays } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function EventsPage() {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as typeof session.user & { isAdmin: boolean; isConfirmed: boolean };

  if (!user.isConfirmed) {
    redirect('/pending-confirmation');
  }

  // Get events data
  const events = await getEvents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <CalendarDays className="h-8 w-8" />
            Dinner Events
          </h1>
          <p className="mt-2 text-muted-foreground">Track and rate our monthly dinner events</p>
        </div>

        {user.isAdmin && <CreateEventDialog />}
      </div>

      {/* Events Table */}
      <div className="rounded-lg border">
        <EventsTable events={events} currentUserId={user.id} isAdmin={user.isAdmin} />
      </div>

      {/* Info for non-admin users */}
      {!user.isAdmin && events.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="mb-2 text-lg font-medium">No dinner events yet</h3>
          <p>Ask an admin to create the first dinner event!</p>
        </div>
      )}

      {/* Stats or additional info could go here */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="text-2xl font-bold">{events.reduce((sum, event) => sum + (event.totalRatings ?? 0), 0)}</div>
            <p className="text-sm text-muted-foreground">Total Ratings</p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="text-2xl font-bold">
              {events.length > 0
                ? (
                    events.reduce((sum, event) => sum + (event.averageRating ?? 0), 0) /
                    (events.filter((e) => e.averageRating).length || 1)
                  ).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
        </div>
      )}
    </div>
  );
}
