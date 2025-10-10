'use client';

import { EventDialog } from '@/components/event-dialog';
import { Button } from '@/components/shadcn/button';
import { Table } from '@/components/table';
import type { user } from '@/db/schema';
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import type { InferSelectModel } from 'drizzle-orm';
import { SquarePen } from 'lucide-react';
import { useState } from 'react';

// Import the EventWithDetails type from events service
type Event = {
  id: string;
  date: Date;
  restaurant: string;
  createdAt: Date;
  updatedAt: Date;
  assignedUsers?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image?: string | null;
    isAdmin: boolean;
    isConfirmed: boolean;
  }[];
};
type User = InferSelectModel<typeof user>;

type Props = {
  events: Event[];
  users: User[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export const EventsTable = ({ events, users, currentUserId, isAdmin }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'restaurant',
      header: 'Restaurant',
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.restaurant}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'date',
      header: 'Datum',
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            {new Date(row.original.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      accessorKey: 'assignedUsers',
      header: 'Gäste',
      cell: ({ row }) => {
        const assignedUsers = row.original.assignedUsers;
        if (!assignedUsers || assignedUsers.length === 0) {
          return <div className="font-medium">-</div>;
        }
        const firstNames = assignedUsers
          .map((user) => user.firstName)
          .filter((name) => name !== null)
          .join(', ');
        return <div className="font-medium">{firstNames || '-'}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {isAdmin && (
              <EventDialog
                mode="edit"
                event={event}
                users={users}
                assignedUserIds={event.assignedUsers?.map((user) => user.id) ?? []}
                trigger={
                  <Button variant="outline" size="sm">
                    <SquarePen />
                    Bearbeiten
                  </Button>
                }
              />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: events,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return <Table table={table} columns={columns} />;
};
