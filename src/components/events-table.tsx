'use client';

import { formatCurrency } from '@/components/cost-table';
import { EventDialog } from '@/components/event-dialog';
import { Button } from '@/components/shadcn/button';
import { Table } from '@/components/table';
import { dayjs } from '@/lib/dayjs';
import type { EventWithDetails, User } from '@/types/events';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SquarePen } from 'lucide-react';

type Props = {
  events: EventWithDetails[];
  users: User[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export const EventsTable = ({ events, users, currentUserId, isAdmin }: Props) => {
  const columns: ColumnDef<EventWithDetails>[] = [
    {
      accessorKey: 'restaurant',
      header: 'Restaurant',
      cell: ({ row }) => <div className="font-medium">{row.original.restaurant}</div>,
    },
    {
      accessorKey: 'date',
      header: 'Datum',
      cell: ({ row }) => dayjs(row.original.date).format('D. MMMM YYYY'),
    },
    {
      accessorKey: 'totalCost',
      header: 'Gesamtkosten',
      cell: ({ row }) => formatCurrency(row.original.totalCost),
    },
    {
      accessorKey: 'assignedUsers',
      header: 'Gäste',
      cell: ({ row }) => {
        const assignedUsers = row.original.assignedUsers;
        if (!assignedUsers || assignedUsers.length === 0) {
          return <div className="font-medium">-</div>;
        }
        const initials = assignedUsers
          .map((user) => user.firstName?.[0])
          .filter(Boolean)
          .join(', ');
        return <div className="font-medium">{initials || '-'}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Aktionen',
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
                <Button variant="outline" size="sm">
                  <SquarePen />
                  Bearbeiten
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
