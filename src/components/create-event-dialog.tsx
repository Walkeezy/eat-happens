'use client';

import { getAllConfirmedUsersAction } from '@/actions/assignments';
import { createEventWithAssignmentsAction } from '@/actions/events';
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
import type { event, user } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { CalendarPlus, Loader2, UserCheck, UserMinus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type CreateEventData = Pick<InferInsertModel<typeof event>, 'restaurant' | 'date'>;
type User = InferSelectModel<typeof user>;

const createEventSchema = z.object({
  restaurant: z.string().min(1, 'Restaurant name is required'),
  date: z.string().min(1, 'Date is required'),
  assignedUserIds: z.array(z.string()).optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export const CreateEventDialog: FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Load confirmed users when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllConfirmedUsersAction();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async ({ restaurant, date }: CreateEventFormData) => {
    try {
      const eventData: CreateEventData & { assignedUserIds?: string[] } = {
        restaurant,
        date: new Date(date),
        assignedUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      };

      const result = await createEventWithAssignmentsAction(eventData);

      form.reset();
      setSelectedUserIds([]);
      setOpen(false);
      router.refresh();

      // Show success message with assignment info
      if (result.assignedCount > 0) {
        toast.success(`Event created successfully! ${result.assignedCount} users assigned.`);
      } else {
        toast.success('Event created successfully! No users assigned yet.');
      }
    } catch (error) {
      console.error('Error creating event', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event. Please try again.';
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

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      restaurant: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      assignedUserIds: [],
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Create Dinner Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Dinner Event</DialogTitle>
          <DialogDescription>
            Add a new dinner event and assign users who can rate it. Only assigned users will be able to provide ratings.
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
                  <FormLabel className="text-base font-medium">Assign Users (Optional)</FormLabel>
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
                      users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 py-1">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer text-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{user.name}</span>
                                <span className="ml-2 text-muted-foreground">{user.email}</span>
                              </div>
                              {user.isAdmin && (
                                <Badge variant="outline" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    💡 You can assign users later using the "Manage Assignments" button on each event.
                  </p>
                </div>
              )}
            </div>

            {form.formState.errors.root && <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
