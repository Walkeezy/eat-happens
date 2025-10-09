'use client';

import { getAllConfirmedUsersAction, getCurrentAssignmentsAction } from '@/actions/assignments';
import { updateEventWithAssignmentsAction } from '@/actions/events';
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
import { event, user } from '@/db/schema';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, SquarePen, UserCheck, UserMinus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Inferred types
type Event = InferSelectModel<typeof event>;
type UpdateEventData = Partial<Pick<InferInsertModel<typeof event>, 'restaurant' | 'date'>>;
type User = InferSelectModel<typeof user>;

const editEventSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant name is required'),
  date: z.string().min(1, 'Date is required'),
  assignedUserIds: z.array(z.string()).optional(),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

type Props = {
  event: Event;
};

export const EditEventDialog: FC<Props> = ({ event }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [initialAssignments, setInitialAssignments] = useState<string[]>([]);

  // Load users and current assignments when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, assignmentsResult] = await Promise.all([
        getAllConfirmedUsersAction(),
        getCurrentAssignmentsAction(event.id),
      ]);

      if (usersResult.success) {
        setUsers(usersResult.users);
      }

      if (assignmentsResult.success) {
        setSelectedUserIds(assignmentsResult.assignedUserIds);
        setInitialAssignments(assignmentsResult.assignedUserIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async ({ restaurant, date }: EditEventFormData) => {
    try {
      const eventData: UpdateEventData & { assignedUserIds?: string[] } = {
        restaurant,
        date: new Date(date),
        assignedUserIds: selectedUserIds,
      };

      const result = await updateEventWithAssignmentsAction(event.id, eventData);

      setOpen(false);
      router.refresh();

      // Show success message with assignment changes
      if (result.assignmentChanges > 0) {
        toast.success(`Event updated successfully! ${result.assignmentChanges} assignment changes made.`);
      } else {
        toast.success('Event updated successfully!');
      }
    } catch (error) {
      console.error('Error updating event', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event. Please try again.';
      toast.error(errorMessage);
      form.setError('root', { message: errorMessage });
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSelectAll = () => {
    setSelectedUserIds(users.map((user) => user.id));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      restaurant: event.restaurant,
      date: new Date(event.date).toISOString().split('T')[0],
      assignedUserIds: [],
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SquarePen className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Dinner Event</DialogTitle>
          <DialogDescription>
            Update the event details and manage user assignments. Only assigned users can rate this event.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Restaurant Name */}
            <FormField
              control={form.control}
              name="restaurant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Italian Place, Sushi Bar Tokyo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dinner Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Assignment Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <FormLabel className="text-base font-medium">Assigned Users</FormLabel>
                </div>
                <Badge variant="secondary">
                  {selectedUserIds.length} of {users.length} selected
                </Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Bulk Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={selectedUserIds.length === users.length}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      disabled={selectedUserIds.length === 0}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Deselect All
                    </Button>
                  </div>

                  {/* User List */}
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                    {users.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No confirmed users available for assignment.
                      </p>
                    ) : (
                      users.map((user) => {
                        const isCurrentlySelected = selectedUserIds.includes(user.id);
                        const wasInitiallyAssigned = initialAssignments.includes(user.id);
                        const hasChanged = isCurrentlySelected !== wasInitiallyAssigned;

                        return (
                          <div key={user.id} className="flex items-center space-x-3 py-1">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              checked={isCurrentlySelected}
                              onChange={() => handleUserToggle(user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer text-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{user.name}</span>
                                  <span className="ml-2 text-muted-foreground">{user.email}</span>
                                  {hasChanged && (
                                    <Badge
                                      variant={isCurrentlySelected ? 'default' : 'destructive'}
                                      className="ml-2 text-xs"
                                    >
                                      {isCurrentlySelected ? 'Will be added' : 'Will be removed'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {user.isAdmin && (
                                    <Badge variant="outline" className="text-xs">
                                      Admin
                                    </Badge>
                                  )}
                                  {wasInitiallyAssigned && !hasChanged && (
                                    <Badge variant="secondary" className="text-xs">
                                      Currently assigned
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </label>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {selectedUserIds.length !== initialAssignments.length ||
                  !selectedUserIds.every((id) => initialAssignments.includes(id)) ? (
                    <p className="text-sm text-muted-foreground">
                      💡 Assignment changes will be applied when you save the event.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">💡 No assignment changes will be made.</p>
                  )}
                </div>
              )}
            </div>

            {form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
