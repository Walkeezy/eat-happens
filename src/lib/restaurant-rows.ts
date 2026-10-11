import { displayCalendarDate } from './calendar-date';
import { shouldHideRatings } from './ratings-visibility';
import type { RestaurantRow } from './restaurants';
import { eventOverall, type RatingScores, scoreAverage } from './scores';
import { costPerPerson } from './statistics';

type RestaurantEvent = {
  id: string;
  date: string;
  restaurant: string;
  totalCost: string | null;
  pickerName: string | null;
  attendeeCount: number;
  ratings: RatingScores[];
};

/** Server side: turns dinners into the rows the restaurant list renders. Kept apart from the list's own module so the browser bundle does not pull in the scoring and statistics code. */
export function buildRestaurantRows(events: RestaurantEvent[]): RestaurantRow[] {
  return events.map((event) => {
    const ratingsHidden = shouldHideRatings(event.date);
    const score = (value: number | undefined) => (ratingsHidden ? undefined : value);

    return {
      id: event.id,
      restaurant: event.restaurant,
      date: event.date,
      displayDate: displayCalendarDate(event.date),
      pickerName: event.pickerName,
      costPerPerson: costPerPerson(event.totalCost, event.attendeeCount),
      ratingsHidden,
      overall: score(eventOverall(event.ratings)),
      food: score(scoreAverage(event.ratings, 'foodScore')),
      ambience: score(scoreAverage(event.ratings, 'ambienceScore')),
      pricePerformance: score(scoreAverage(event.ratings, 'pricePerformanceScore')),
    };
  });
}
