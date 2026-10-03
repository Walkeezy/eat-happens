'use client';

import dynamic from 'next/dynamic';
import { type FC, type ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import { Skeleton } from '@/components/shadcn/skeleton';

const loadRatingForm = () => import('@/components/rating-form').then((module) => module.RatingForm);

const RatingForm = dynamic(loadRatingForm, {
  ssr: false,
  loading: () => <Skeleton className="h-72" />,
});

type Props = {
  eventId: string;
  trigger: ReactNode;
};

export const RatingDialog: FC<Props> = ({ eventId, trigger }) => {
  const [open, setOpen] = useState(false);

  // Start fetching the form as soon as someone reaches for the trigger, so it is usually there when the dialog opens.
  const preloadForm = () => void loadRatingForm();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onPointerEnter={preloadForm} onFocus={preloadForm}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dieses Dinner bewerten</DialogTitle>
        </DialogHeader>
        <RatingForm eventId={eventId} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
