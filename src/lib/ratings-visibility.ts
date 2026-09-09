import { calendarYear, isValidCalendarDate, todayCalendarDate } from './calendar-date';

function calendarDateFromEventDate(eventDate: string): string | null {
  if (isValidCalendarDate(eventDate)) {
    return eventDate;
  }

  const prefix = eventDate.slice(0, 10);
  if (isValidCalendarDate(prefix)) {
    return prefix;
  }

  return null;
}

export function shouldHideRatings(eventDate: string): boolean {
  const calendarDate = calendarDateFromEventDate(eventDate);
  if (!calendarDate) {
    return false;
  }

  return calendarYear(calendarDate) === calendarYear(todayCalendarDate());
}

type RatingScores = {
  userId: string;
  legacyScore: number | null;
  foodScore: number | null;
  ambienceScore: number | null;
  pricePerformanceScore: number | null;
};

type EventRatingsVisibility<TRating extends RatingScores> = {
  date: string;
  ratings?: TRating[];
  averageLegacyRating?: number;
  averageFoodRating?: number;
  averageAmbienceRating?: number;
  averagePricePerformanceRating?: number;
};

export function applyRatingsVisibility<TRating extends RatingScores, TEvent extends EventRatingsVisibility<TRating>>(
  event: TEvent,
  currentUserId?: string,
): TEvent {
  if (!shouldHideRatings(event.date)) {
    return event;
  }

  return {
    ...event,
    averageLegacyRating: undefined,
    averageFoodRating: undefined,
    averageAmbienceRating: undefined,
    averagePricePerformanceRating: undefined,
    ratings: event.ratings?.map((rating) =>
      rating.userId === currentUserId
        ? rating
        : {
            ...rating,
            legacyScore: null,
            foodScore: null,
            ambienceScore: null,
            pricePerformanceScore: null,
          },
    ),
  };
}
