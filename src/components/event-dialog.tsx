'use client';

import dynamic from 'next/dynamic';
import type { FC, ReactNode } from 'react';
import type { EventFormEvent, EventFormUser } from '@/components/event-form';
import { FormPlaceholder, LazyDialog } from '@/components/lazy-dialog';

const loadEventForm = () => import('@/components/event-form').then((module) => module.EventForm);

const EventForm = dynamic(loadEventForm, { ssr: false, loading: () => <FormPlaceholder className="h-[30rem]" /> });

// Hoisted so a dialog without assignees does not hand the form a new array on every render.
const noAssignees: string[] = [];

type Props = {
  mode: 'create' | 'edit';
  event?: EventFormEvent;
  users: EventFormUser[];
  assignedUserIds?: string[];
  trigger: ReactNode;
};

export const EventDialog: FC<Props> = ({ mode, event, users, assignedUserIds = noAssignees, trigger }) => (
  <LazyDialog title={mode === 'edit' ? 'Event bearbeiten' : 'Event erstellen'} trigger={trigger} preloadForm={loadEventForm}>
    {(close) => <EventForm mode={mode} event={event} users={users} assignedUserIds={assignedUserIds} onSaved={close} />}
  </LazyDialog>
);
