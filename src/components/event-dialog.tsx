'use client';

import dynamic from 'next/dynamic';
import { type FC, type ReactNode, useState } from 'react';
import type { EventFormEvent, EventFormUser } from '@/components/event-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import { Skeleton } from '@/components/shadcn/skeleton';

const loadEventForm = () => import('@/components/event-form').then((module) => module.EventForm);

const EventForm = dynamic(loadEventForm, {
  ssr: false,
  loading: () => <Skeleton className="h-[30rem]" />,
});

type Props = {
  mode: 'create' | 'edit';
  event?: EventFormEvent;
  users: EventFormUser[];
  assignedUserIds?: string[];
  trigger: ReactNode;
};

export const EventDialog: FC<Props> = ({ mode, event, users, assignedUserIds = [], trigger }) => {
  const [open, setOpen] = useState(false);

  // Start fetching the form as soon as someone reaches for the trigger, so it is usually there when the dialog opens.
  const preloadForm = () => void loadEventForm();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onPointerEnter={preloadForm} onFocus={preloadForm}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Event bearbeiten' : 'Event erstellen'}</DialogTitle>
        </DialogHeader>
        <EventForm
          mode={mode}
          event={event}
          users={users}
          assignedUserIds={assignedUserIds}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
