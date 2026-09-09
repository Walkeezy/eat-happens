'use client';

import { RatingDialog } from '@/components/rating-dialog';
import { Button } from '@/components/shadcn/button';
import { displayCalendarDate } from '@/lib/calendar-date';
import type { EventWithDetails } from '@/types/events';

export function RateLastDinnerBanner({ event }: { event: EventWithDetails }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Letztes Dinner bewerten</p>
        <p className="text-sm text-muted-foreground">
          {event.restaurant} · {displayCalendarDate(event.date)}
        </p>
      </div>
      <RatingDialog event={event} trigger={<Button>Jetzt bewerten</Button>} />
    </div>
  );
}
