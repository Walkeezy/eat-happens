'use client';

import { checkUserAssignmentAction } from '@/actions/assignments';
import { upsertRatingAction } from '@/actions/ratings';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { Input } from '@/components/shadcn/input';
import type { event, rating } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { Lock, MessageSquare, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ratingSchema = z.object({
  score: z.number().min(1, 'Please provide a rating').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

type Event = InferSelectModel<typeof event>;
type Rating = InferSelectModel<typeof rating>;
type CreateRatingData = Pick<InferInsertModel<typeof rating>, 'eventId' | 'score' | 'comment'>;

type Props = {
  event: Event;
  currentUserId: string;
  existingRating?: Rating;
};

export const RatingDialog: FC<Props> = ({ event, currentUserId, existingRating }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isAssigned, setIsAssigned] = useState<boolean | null>(null);
  const [checkingAssignment, setCheckingAssignment] = useState(true);

  // Check if user is assigned to event
  useEffect(() => {
    const checkAssignment = async () => {
      try {
        const result = await checkUserAssignmentAction(event.id);
        setIsAssigned(result.isAssigned);
      } catch (error) {
        console.error('Error checking assignment:', error);
        setIsAssigned(false);
      } finally {
        setCheckingAssignment(false);
      }
    };

    checkAssignment();
  }, [event.id]);

  const onSubmit = async ({ score, comment }: RatingFormData) => {
    if (!isAssigned) {
      toast.error('You can only rate events you are assigned to');
      return;
    }

    try {
      const ratingData: CreateRatingData = {
        eventId: event.id,
        score,
        comment: comment || undefined,
      };

      await upsertRatingAction(ratingData);

      setOpen(false);
      router.refresh();
      toast.success(existingRating ? 'Rating updated successfully' : 'Rating submitted successfully');
    } catch (error) {
      console.error('Error saving rating', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save rating. Please try again.';
      toast.error(errorMessage);
      form.setError('root', { message: errorMessage });
    }
  };

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      score: existingRating?.score || 0,
      comment: existingRating?.comment || '',
    },
  });

  const watchedScore = form.watch('score');

  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="rounded-sm p-1 transition-colors hover:bg-gray-100"
            onClick={() => form.setValue('score', star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredStar || watchedScore) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {watchedScore > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {watchedScore} star{watchedScore !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  // Show loading state while checking assignment
  if (checkingAssignment) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Star className="mr-2 h-4 w-4" />
        Checking...
      </Button>
    );
  }

  // If user is not assigned, show disabled button with explanation
  if (!isAssigned) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <Lock className="mr-2 h-4 w-4" />
          Not Assigned
        </Button>
        <Badge variant="secondary" className="text-xs">
          Only assigned users can rate
        </Badge>
      </div>
    );
  }

  const buttonText = existingRating ? 'Update Rating' : 'Rate Dinner';
  const buttonIcon = existingRating ? <Star className="mr-2 h-4 w-4 fill-current" /> : <Star className="mr-2 h-4 w-4" />;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingRating ? 'default' : 'outline'} size="sm">
          {buttonIcon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingRating ? 'Update Your Rating' : 'Rate This Dinner'}</DialogTitle>
          <DialogDescription>How was your experience at {event.restaurant}?</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <FormField
              control={form.control}
              name="score"
              render={() => (
                <FormItem>
                  <FormLabel>Your Rating *</FormLabel>
                  <FormControl>
                    <StarRating />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <MessageSquare className="mr-2 inline h-4 w-4" />
                    Comment (optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Share your thoughts about the dinner..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : existingRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
