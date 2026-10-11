import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { event, rating, user } from '@/db/schema';
import type { RatingScores } from '@/lib/scores';

// Basic types from schema
export type Event = InferSelectModel<typeof event>;
export type User = InferSelectModel<typeof user>;

// Insert types
export type CreateEventData = Pick<InferInsertModel<typeof event>, 'restaurant' | 'date' | 'totalCost' | 'pickedByUserId'>;
export type UpdateEventData = Partial<CreateEventData>;
export type CreateRatingData = Pick<
  InferInsertModel<typeof rating>,
  'eventId' | 'foodScore' | 'ambienceScore' | 'pricePerformanceScore'
>;

type UserSummary = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  image?: string | null;
};

/** The rating fields the UI reads; the rater is only loaded where a page shows people who are not on the guest list. */
export type EventRating = RatingScores & {
  userId: string;
  user?: UserSummary;
};

// Complex type for joined/computed data
export type EventWithDetails = Event & {
  ratings?: EventRating[];
  averageLegacyRating?: number;
  averageFoodRating?: number;
  averageAmbienceRating?: number;
  averagePricePerformanceRating?: number;
  totalRatings?: number;
  assignedUsers?: UserSummary[];
  pickedByUser?: Omit<UserSummary, 'image'> | null;
};
