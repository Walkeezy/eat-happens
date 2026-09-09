'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { type FC, type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createEventWithAssignmentsAction, updateEventWithAssignmentsAction } from '@/actions/events';
import { Button } from '@/components/shadcn/button';
import { Checkbox } from '@/components/shadcn/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn/form';
import { Input } from '@/components/shadcn/input';
import { Select } from '@/components/shadcn/select';
import { todayCalendarDate } from '@/lib/calendar-date';
import { calendarDateSchema, optionalTotalCostInputSchema, parseOptionalTotalCost } from '@/lib/schemas';
import { displayName } from '@/lib/user';
import type { Event, User } from '@/types/events';

const eventSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant-Name ist erforderlich'),
  date: calendarDateSchema,
  users: z.array(z.string()).min(1, 'Mindestens ein Benutzer muss ausgewählt werden'),
  totalCost: optionalTotalCostInputSchema,
  pickedByUserId: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

type Props = {
  mode: 'create' | 'edit';
  event?: Event;
  users: User[];
  assignedUserIds?: string[];
  trigger: ReactNode;
};

export const EventDialog: FC<Props> = ({ mode, event, users, assignedUserIds = [], trigger }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      restaurant: event?.restaurant ?? '',
      date: event?.date ?? todayCalendarDate(),
      users: assignedUserIds,
      totalCost: event?.totalCost ?? '',
      pickedByUserId: event?.pickedByUserId ?? '',
    },
  });

  const onSubmit = async ({ restaurant, date, users, totalCost, pickedByUserId }: EventFormData) => {
    try {
      const eventData = {
        restaurant,
        date,
        assignedUserIds: users,
        totalCost: parseOptionalTotalCost(totalCost),
        pickedByUserId: pickedByUserId === '' ? null : pickedByUserId,
      };

      if (mode === 'edit' && event) {
        await updateEventWithAssignmentsAction(event.id, eventData);
      } else {
        await createEventWithAssignmentsAction(eventData);
      }

      toast.success(mode === 'edit' ? 'Event wurde aktualisiert' : 'Event wurde erstellt');
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Event konnte nicht gespeichert werden';
      form.setError('root', { message: errorMessage });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Event bearbeiten' : 'Event erstellen'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="restaurant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant-Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dinner-Datum *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gesamtkosten (CHF)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="z.B. 125.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickedByUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ausgewählt von</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="">Unbekannt</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {displayName(user)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="users"
              render={() => (
                <FormItem>
                  <FormLabel>Benutzer zuweisen *</FormLabel>
                  <div className="space-y-3">
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                      {users.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Keine bestätigten Benutzer verfügbar.
                        </p>
                      ) : (
                        users.map((user) => (
                          <FormField
                            key={user.id}
                            control={form.control}
                            name="users"
                            render={({ field }) => {
                              return (
                                <FormItem key={user.id} className="flex flex-row items-center gap-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), user.id])
                                          : field.onChange(field.value?.filter((value) => value !== user.id) || []);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">{user.firstName}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Speichere...' : mode === 'edit' ? 'Änderungen speichern' : 'Event erstellen'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
