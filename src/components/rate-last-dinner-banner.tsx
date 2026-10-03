'use client';

import { Star } from 'lucide-react';
import { Banner, BannerIcon } from '@/components/banner';
import { RatingDialog } from '@/components/rating-dialog';
import { RestaurantLink } from '@/components/restaurant-link';
import { Button } from '@/components/shadcn/button';
import { displayCalendarDate } from '@/lib/calendar-date';
import type { EventWithDetails } from '@/types/events';

export function RateLastDinnerBanner({ event }: { event: EventWithDetails }) {
  return (
    <Banner
      icon={
        <BannerIcon>
          <Star />
        </BannerIcon>
      }
      title="Letztes Dinner bewerten"
      description={
        <>
          <RestaurantLink id={event.id}>{event.restaurant}</RestaurantLink> · {displayCalendarDate(event.date)}
        </>
      }
      action={<RatingDialog event={event} trigger={<Button>Jetzt bewerten</Button>} />}
    />
  );
}
