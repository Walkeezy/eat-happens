import { z } from 'zod';

export const scoreSchema = z
  .number()
  .min(1, 'Bitte gib eine Bewertung ab')
  .max(5, 'Bewertung kann nicht mehr als 5 Sterne haben');

export const ratingSchema = z.object({
  foodScore: scoreSchema,
  ambienceScore: scoreSchema,
  pricePerformanceScore: scoreSchema,
});

export const createRatingSchema = ratingSchema.extend({
  eventId: z.string().min(1, 'Event-ID ist erforderlich'),
});

export type RatingFormData = z.infer<typeof ratingSchema>;
