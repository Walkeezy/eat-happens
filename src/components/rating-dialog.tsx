'use client';

import { upsertRatingAction } from '@/actions/ratings';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { StarRating } from '@/components/star-rating';
import type { event, rating } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { useRouter } from 'next/navigation';
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ratingSchema = z.object({
  score: z.number().min(1, 'Bitte gib eine Bewertung ab').max(5, 'Bewertung kann nicht mehr als 5 Sterne haben'),
  comment: z.string().optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;
type Event = InferSelectModel<typeof event>;
type Rating = InferSelectModel<typeof rating>;
type CreateRatingData = Pick<InferInsertModel<typeof rating>, 'eventId' | 'score'>;

type Props = {
  event: Event;
  existingRating?: Rating;
  isAssigned?: boolean;
  trigger: ReactNode;
};

export const RatingDialog: FC<Props> = ({ event, existingRating, isAssigned = true, trigger }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      score: existingRating?.score || 0,
    },
  });

  const watchedScore = form.watch('score');

  const onSubmit = useCallback(
    async ({ score }: RatingFormData) => {
      if (!isAssigned) {
        toast.error('Du kannst nur Events bewerten, denen du zugewiesen bist');
        return;
      }

      try {
        const ratingData: CreateRatingData = {
          eventId: event.id,
          score,
        };

        await upsertRatingAction(ratingData);

        setOpen(false);
        router.refresh();
        toast.success(existingRating ? 'Bewertung erfolgreich aktualisiert' : 'Bewertung erfolgreich abgegeben');
      } catch (error) {
        console.error('Error saving rating', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Fehler beim Speichern der Bewertung. Bitte versuche es erneut.';
        toast.error(errorMessage);
        form.setError('root', { message: errorMessage });
      }
    },
    [isAssigned, event.id, existingRating, router, form],
  );

  const handleScoreChange = useCallback(
    (score: number) => {
      form.setValue('score', score);
    },
    [form],
  );

  const dialogConfig = useMemo(
    () => ({
      title: existingRating ? 'Deine Bewertung aktualisieren' : 'Dieses Dinner bewerten',
      description: `Wie war deine Erfahrung bei ${event.restaurant}?`,
    }),
    [existingRating, event.restaurant],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogConfig.title}</DialogTitle>
          <DialogDescription>{dialogConfig.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="score"
              render={() => (
                <FormItem>
                  <FormLabel>Deine Bewertung *</FormLabel>
                  <StarRating score={watchedScore} onScoreChange={handleScoreChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="min-h-[44px] w-full sm:w-auto"
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="min-h-[44px] w-full sm:w-auto">
                {form.formState.isSubmitting
                  ? 'Speichere...'
                  : existingRating
                    ? 'Bewertung aktualisieren'
                    : 'Bewertung abgeben'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
