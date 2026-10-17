'use client';

import dynamic from 'next/dynamic';
import type { FC, ReactNode } from 'react';
import { FormPlaceholder, LazyDialog } from '@/components/lazy-dialog';

const loadRatingForm = () => import('@/components/rating-form').then((module) => module.RatingForm);

const RatingForm = dynamic(loadRatingForm, { ssr: false, loading: () => <FormPlaceholder className="h-72" /> });

type Props = {
  eventId: string;
  trigger: ReactNode;
};

export const RatingDialog: FC<Props> = ({ eventId, trigger }) => (
  <LazyDialog title="Dieses Dinner bewerten" trigger={trigger} preloadForm={loadRatingForm}>
    {(close) => <RatingForm eventId={eventId} onSaved={close} />}
  </LazyDialog>
);
