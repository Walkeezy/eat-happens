import { z } from 'zod';
import { isValidCalendarDate } from './calendar-date';

const scoreSchema = z.number().min(1, 'Bitte gib eine Bewertung ab').max(5, 'Bewertung kann nicht mehr als 5 Sterne haben');

export const ratingSchema = z.object({
  foodScore: scoreSchema,
  ambienceScore: scoreSchema,
  pricePerformanceScore: scoreSchema,
});

export const createRatingSchema = ratingSchema.extend({
  eventId: z.string().min(1, 'Event-ID ist erforderlich'),
});

export type RatingFormData = z.infer<typeof ratingSchema>;

export const calendarDateSchema = z
  .string()
  .min(1, 'Datum ist erforderlich')
  .refine((value) => isValidCalendarDate(value), 'Datum ist ungültig');

export const eventWithAssignmentsSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant-Name ist erforderlich'),
  date: calendarDateSchema,
  assignedUserIds: z.array(z.string()).min(1, 'Mindestens ein Benutzer muss zugewiesen werden'),
  totalCost: z.number().positive().nullable(),
});

export type EventWithAssignmentsData = z.infer<typeof eventWithAssignmentsSchema>;

export function parseOptionalTotalCost(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}
