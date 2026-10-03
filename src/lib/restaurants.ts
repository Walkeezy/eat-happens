import { shouldHideRatings } from './ratings-visibility';
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

export type RestaurantRow = {
  id: string;
  restaurant: string;
  date: string;
  pickerName: string | null;
  costPerPerson: number | null;
  /** The current year's group scores stay hidden until January, just like on the statistics page. */
  ratingsHidden: boolean;
  overall: number | undefined;
  food: number | undefined;
  ambience: number | undefined;
  pricePerformance: number | undefined;
};

export type RestaurantSort = 'date' | 'rating' | 'cost';

export function buildRestaurantRows(events: RestaurantEvent[]): RestaurantRow[] {
  return events.map((event) => {
    const ratingsHidden = shouldHideRatings(event.date);
    const score = (value: number | undefined) => (ratingsHidden ? undefined : value);

    return {
      id: event.id,
      restaurant: event.restaurant,
      date: event.date,
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

/** Lower-cased and without accents, so "cafe" finds "Café". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Missing values always sink to the bottom, whatever the direction. */
function compareDescending(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null || b == null) {
    return (a == null ? 1 : 0) - (b == null ? 1 : 0);
  }

  return b - a;
}

export function filterAndSortRestaurants(rows: RestaurantRow[], query: string, sort: RestaurantSort): RestaurantRow[] {
  const needle = normalize(query);
  const byDate = (a: RestaurantRow, b: RestaurantRow) => b.date.localeCompare(a.date);
  const comparators: Record<RestaurantSort, (a: RestaurantRow, b: RestaurantRow) => number> = {
    date: byDate,
    rating: (a, b) => compareDescending(a.overall, b.overall) || byDate(a, b),
    cost: (a, b) => compareDescending(a.costPerPerson, b.costPerPerson) || byDate(a, b),
  };

  return rows.filter((row) => normalize(row.restaurant).includes(needle)).sort(comparators[sort]);
}
