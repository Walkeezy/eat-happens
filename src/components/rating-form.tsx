'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { saveRatingAction } from '@/actions/ratings';
import { Button } from '@/components/shadcn/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { StarVoting } from '@/components/star-voting';
import { ratingCategories } from '@/lib/constants';
import { type RatingFormData, ratingSchema } from '@/lib/schemas';

type Props = {
  eventId: string;
  onSaved: () => void;
};

/** Loaded on demand by RatingDialog, so react-hook-form and zod stay out of the first page load. */
export function RatingForm({ eventId, onSaved }: Props) {
  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      foodScore: 0,
      ambienceScore: 0,
      pricePerformanceScore: 0,
    },
  });

  const onSubmit = async (data: RatingFormData) => {
    // The action revalidates the layout, so the page re-renders with the new rating in the same round trip.
    const result = await saveRatingAction({ eventId, ...data });

    if (!result.success) {
      form.setError('root', { message: result.error });
      return;
    }

    toast.success('Bewertung wurde gespeichert');
    onSaved();
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
                {/* field.onChange (not setValue) re-validates, so "Bitte gib eine Bewertung ab" clears on the first star. */}
                <StarVoting score={field.value} onScoreChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {form.formState.errors.root ? (
          <div className="text-sm text-destructive">{form.formState.errors.root.message}</div>
        ) : null}

        <div className="flex justify-center pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
            {form.formState.isSubmitting ? 'Speichere...' : 'Bewertung abgeben'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
