'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SquarePen } from 'lucide-react';
import { AvatarStack } from '@/components/avatar-stack';
import { EventDialog } from '@/components/event-dialog';
import { Button } from '@/components/shadcn/button';
import { Table } from '@/components/table';
import { displayCalendarDate } from '@/lib/calendar-date';
import { formatCurrency } from '@/lib/format';
import { displayName } from '@/lib/user';
import type { EventWithDetails, User } from '@/types/events';

type Props = {
  events: EventWithDetails[];
  users: User[];
  isAdmin?: boolean;
};

export const EventsTable = ({ events, users, isAdmin }: Props) => {
  const columns: ColumnDef<EventWithDetails>[] = [
    {
      accessorKey: 'restaurant',
      header: 'Restaurant',
      meta: { className: 'whitespace-normal' },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.restaurant}</div>
          <div className="text-xs text-muted-foreground md:hidden">{displayCalendarDate(row.original.date)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Datum',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ row }) => displayCalendarDate(row.original.date),
    },
    {
      accessorKey: 'totalCost',
      header: 'Gesamtkosten',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ row }) => formatCurrency(row.original.totalCost),
    },
    {
      accessorKey: 'pickedByUser',
      header: 'Auswahl',
      meta: { className: 'hidden md:table-cell' },
      cell: ({ row }) => (row.original.pickedByUser ? displayName(row.original.pickedByUser) : '-'),
    },
    {
      accessorKey: 'assignedUsers',
      header: 'Gäste',
      cell: ({ row }) => {
        const assignedUsers = row.original.assignedUsers;
        if (!assignedUsers || assignedUsers.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }

        return <AvatarStack users={assignedUsers} max={4} />;
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Aktionen</span>,
      meta: { className: 'text-right' },
      cell: ({ row }) => {
        const event = row.original;

        return (
          isAdmin && (
            <EventDialog
              mode="edit"
              event={event}
              users={users}
              assignedUserIds={event.assignedUsers?.map((user) => user.id) ?? []}
              trigger={
                <Button variant="outline" size="sm" aria-label={`${event.restaurant} bearbeiten`}>
                  <SquarePen />
                  <span className="hidden sm:inline">Bearbeiten</span>
                </Button>
              }
            />
          )
        );
      },
    },
  ];

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
