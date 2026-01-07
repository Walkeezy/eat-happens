import type { event, eventAssignment, rating, user } from '@/db/schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Basic types from schema
export type Event = InferSelectModel<typeof event>;
export type User = InferSelectModel<typeof user>;
type EventAssignment = InferSelectModel<typeof eventAssignment>;
export type Rating = InferSelectModel<typeof rating>;

// Insert types
export type CreateEventData = Pick<InferInsertModel<typeof event>, 'restaurant' | 'date' | 'totalCost'>;
export type UpdateEventData = Partial<CreateEventData>;
export type CreateRatingData = Pick<
  InferInsertModel<typeof rating>,
  'eventId' | 'foodScore' | 'ambienceScore' | 'pricePerformanceScore'
>;

// Complex type for joined/computed data
export type EventWithDetails = Event & {
  ratings?: (Rating & {
    user?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      image?: string | null;
    };
  })[];
  averageLegacyRating?: number;
  averageFoodRating?: number;
  averageAmbienceRating?: number;
  averagePricePerformanceRating?: number;
  totalRatings?: number;
  assignments?: EventAssignment[];
  assignedUsers?: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image?: string | null;
    isAdmin: boolean;
    isConfirmed: boolean;
  }[];
};
