import { db } from '@/db';
import { event, rating, user } from '@/db/schema';
import { avg, count, desc, gte, sql } from 'drizzle-orm';

export type Statistics = {
  totalEvents: number;
  totalRatings: number;
  totalUsers: number;
  averageRating: number;
  ratingDistribution: { score: number; count: number }[];
  topRatedRestaurant: { restaurant: string; averageRating: number } | null;
  worstRatedRestaurant: { restaurant: string; averageRating: number } | null;
  mostActiveUser: { name: string; ratingCount: number } | null;
  eventsThisYear: number;
};

export async function getStatistics(): Promise<Statistics> {
  // Total events
  const [{ count: totalEvents }] = await db.select({ count: count() }).from(event);

  // Total ratings
  const [{ count: totalRatings }] = await db.select({ count: count() }).from(rating);

  // Total users
  const [{ count: totalUsers }] = await db.select({ count: count() }).from(user);

  // Average rating across all events
  const [{ avg: averageRating }] = await db.select({ avg: avg(rating.score) }).from(rating);

  // Rating distribution (1-5 stars)
  const ratingDistributionResult = await db
    .select({
      score: rating.score,
      count: count(),
    })
    .from(rating)
    .groupBy(rating.score)
    .orderBy(rating.score);

  // Ensure all scores 1-5 are present
  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: ratingDistributionResult.find((r) => r.score === score)?.count ?? 0,
  }));

  // Top rated restaurant (with at least 3 ratings for fairness)
  const topRated = await db
    .select({
      restaurant: event.restaurant,
      averageRating: sql<number>`avg(${rating.score})`,
      ratingCount: count(),
    })
    .from(event)
    .innerJoin(rating, sql`${event.id} = ${rating.eventId}`)
    .groupBy(event.restaurant)
    .having(sql`count(*) >= 3`)
    .orderBy(desc(sql`avg(${rating.score})`))
    .limit(1);

  // Worst rated restaurant (with at least 3 ratings for fairness)
  const worstRated = await db
    .select({
      restaurant: event.restaurant,
      averageRating: sql<number>`avg(${rating.score})`,
      ratingCount: count(),
    })
    .from(event)
    .innerJoin(rating, sql`${event.id} = ${rating.eventId}`)
    .groupBy(event.restaurant)
    .having(sql`count(*) >= 3`)
    .orderBy(sql`avg(${rating.score})`)
    .limit(1);

  // Most active user
  const mostActive = await db
    .select({
      userId: rating.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      ratingCount: count(),
    })
    .from(rating)
    .innerJoin(user, sql`${rating.userId} = ${user.id}`)
    .groupBy(rating.userId, user.firstName, user.lastName, user.name)
    .orderBy(desc(count()))
    .limit(1);

  // Events this month

  // Events this year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const [{ count: eventsThisYear }] = await db.select({ count: count() }).from(event).where(gte(event.date, startOfYear));

  return {
    totalEvents,
    totalRatings,
    totalUsers,
    averageRating: averageRating ? Number(averageRating) : 0,
    ratingDistribution,
    topRatedRestaurant: topRated[0]
      ? {
          restaurant: topRated[0].restaurant,
          averageRating: Number(topRated[0].averageRating),
        }
      : null,
    worstRatedRestaurant: worstRated[0]
      ? {
          restaurant: worstRated[0].restaurant,
          averageRating: Number(worstRated[0].averageRating),
        }
      : null,
    mostActiveUser: mostActive[0]
      ? {
          name:
            mostActive[0].firstName && mostActive[0].lastName
              ? `${mostActive[0].firstName} ${mostActive[0].lastName}`
              : (mostActive[0].name ?? 'Unbekannt'),
          ratingCount: Number(mostActive[0].ratingCount),
        }
      : null,
    eventsThisYear,
  };
}
