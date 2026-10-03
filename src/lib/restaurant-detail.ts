import { shouldHideRatings } from './ratings-visibility';
import { eventOverall, type RatingScores, ratingOverall, scoreAverage, scoreRange } from './scores';
import { costPerPerson } from './statistics';

type DetailPerson = { id: string; name: string | null; email: string; image?: string | null };

type DetailRating = RatingScores & { userId: string; user?: DetailPerson };

type DetailEvent = {
  date: string;
  totalCost: string | null;
  assignedUsers?: DetailPerson[];
  ratings?: DetailRating[];
};

export type RestaurantDetail = {
  /** The current year's group scores stay hidden until January, just like on the statistics page. */
  ratingsHidden: boolean;
  overall: number | undefined;
  food: number | undefined;
  ambience: number | undefined;
  pricePerformance: number | undefined;
  spread: { min: number; max: number; spread: number } | undefined;
  costPerPerson: number | null;
  people: { person: DetailPerson; rating: DetailRating | undefined }[];
  ratedCount: number;
};

const personName = (person: DetailPerson) => person.name ?? person.email;

export function buildRestaurantDetail(event: DetailEvent): RestaurantDetail {
  const ratingsHidden = shouldHideRatings(event.date);
  const ratings = event.ratings ?? [];
  const assigned = event.assignedUsers ?? [];
  const score = <T>(value: T) => (ratingsHidden ? undefined : value);

  // Imported dinners can carry ratings from people who are not on the guest list - they still count.
  const ratersOnly = ratings
    .map((rating) => rating.user)
    .filter((user): user is DetailPerson => user !== undefined && !assigned.some((person) => person.id === user.id));

  const people = [...assigned, ...ratersOnly]
    .map((person) => ({ person, rating: ratings.find((rating) => rating.userId === person.id) }))
    .sort((a, b) => {
      if (!ratingsHidden) {
        const scoreA = a.rating ? ratingOverall(a.rating) : null;
        const scoreB = b.rating ? ratingOverall(b.rating) : null;
        const byScore = (scoreB ?? -1) - (scoreA ?? -1);
        if (byScore !== 0) {
          return byScore;
        }
      }

      return personName(a.person).localeCompare(personName(b.person));
    });

  return {
    ratingsHidden,
    overall: score(eventOverall(ratings)),
    food: score(scoreAverage(ratings, 'foodScore')),
    ambience: score(scoreAverage(ratings, 'ambienceScore')),
    pricePerformance: score(scoreAverage(ratings, 'pricePerformanceScore')),
    spread: score(scoreRange(ratings)),
    costPerPerson: costPerPerson(event.totalCost, assigned.length),
    people,
    ratedCount: people.filter((entry) => entry.rating !== undefined).length,
  };
}
