'use client';

import { saveRatingAction } from '@/actions/ratings';
import { Button } from '@/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { StarVoting } from '@/components/star-voting';
import { ratingCategories } from '@/lib/constants';
import type { CreateRatingData, Event, Rating } from '@/types/events';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const scoreSchema = z.number().min(1, 'Bitte gib eine Bewertung ab').max(5, 'Bewertung kann nicht mehr als 5 Sterne haben');

const ratingSchema = z.object({
  foodScore: scoreSchema,
  ambienceScore: scoreSchema,
  pricePerformanceScore: scoreSchema,
});

type RatingFormData = z.infer<typeof ratingSchema>;

type Props = {
  mode: 'create' | 'edit';
  event: Event;
  existingRating?: Rating;
  isAssigned?: boolean;
  trigger: ReactNode;
};

export const RatingDialog: FC<Props> = ({ mode, event, existingRating, trigger }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      foodScore: existingRating?.foodScore || 0,
      ambienceScore: existingRating?.ambienceScore || 0,
      pricePerformanceScore: existingRating?.pricePerformanceScore || 0,
    },
  });

  const onSubmit = async (data: RatingFormData) => {
    try {
      const ratingData: CreateRatingData = {
        eventId: event.id,
        ...data,
      };

      await saveRatingAction(ratingData);

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving rating', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Fehler beim Speichern der Bewertung. Bitte versuche es erneut.';
      form.setError('root', { message: errorMessage });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Dieses Dinner bewerten' : 'Deine Bewertung aktualisieren'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {ratingCategories.map(({ key, label }) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <StarVoting score={field.value} onScoreChange={(score) => form.setValue(key, score)} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}

            <div className="flex justify-center pt-2">
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                {form.formState.isSubmitting
                  ? 'Speichere...'
                  : mode === 'edit'
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
