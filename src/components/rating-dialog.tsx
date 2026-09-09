'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { type FC, type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { saveRatingAction } from '@/actions/ratings';
import { Button } from '@/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { StarVoting } from '@/components/star-voting';
import { ratingCategories } from '@/lib/constants';
import { type RatingFormData, ratingSchema } from '@/lib/schemas';
import type { CreateRatingData, Event } from '@/types/events';

type Props = {
  event: Event;
  trigger: ReactNode;
};

export const RatingDialog: FC<Props> = ({ event, trigger }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
        eventId: event.id,
        ...data,
      };

      await saveRatingAction(ratingData);

      toast.success('Bewertung wurde gespeichert');
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
          <DialogTitle>Dieses Dinner bewerten</DialogTitle>
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
                {form.formState.isSubmitting ? 'Speichere...' : 'Bewertung abgeben'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
