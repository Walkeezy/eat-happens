'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { saveRatingAction } from '@/actions/ratings';
import { Button } from '@/components/shadcn/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { StarVoting } from '@/components/star-voting';
import { ratingCategories } from '@/lib/constants';
import { type RatingFormData, ratingSchema } from '@/lib/schemas';
import type { CreateRatingData } from '@/types/events';

type Props = {
  eventId: string;
  onSaved: () => void;
};

/** Loaded on demand by RatingDialog, so react-hook-form and zod stay out of the first page load. */
export function RatingForm({ eventId, onSaved }: Props) {
  const router = useRouter();

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      foodScore: 0,
      ambienceScore: 0,
      pricePerformanceScore: 0,
    },
  });

  const onSubmit = async (data: RatingFormData) => {
    try {
      const ratingData: CreateRatingData = {
        eventId,
        ...data,
      };

      await saveRatingAction(ratingData);

      toast.success('Bewertung wurde gespeichert');
      onSaved();
      router.refresh();
    } catch (error) {
      console.error('Error saving rating', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Fehler beim Speichern der Bewertung. Bitte versuche es erneut.';
      form.setError('root', { message: errorMessage });
    }
  };

  return (
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

        {form.formState.errors.root && <div className="text-sm text-destructive">{form.formState.errors.root.message}</div>}

        <div className="flex justify-center pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
            {form.formState.isSubmitting ? 'Speichere...' : 'Bewertung abgeben'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
