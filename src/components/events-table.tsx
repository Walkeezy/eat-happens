'use client';

import { type ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SquarePen } from 'lucide-react';
import { useMemo } from 'react';
import { AvatarStack } from '@/components/avatar-stack';
import { EventDialog } from '@/components/event-dialog';
import type { EventFormEvent, EventFormUser } from '@/components/event-form';
import { RestaurantLink } from '@/components/restaurant-link';
import { Button } from '@/components/shadcn/button';
import { Table } from '@/components/table';
import { displayCalendarDate } from '@/lib/calendar-date';
import { formatCurrency } from '@/lib/format';

/** What the admin table needs per dinner - mapped on the server so the browser does not get every rating and user row. */
export type AdminEventRow = EventFormEvent & {
  pickerName: string | null;
  /** Decided on the server, so the browser's time zone cannot disagree with it during hydration. */
  isPast: boolean;
  assignedUsers: { id: string; name: string | null; firstName: string | null; email: string; image: string | null }[];
};

type Props = {
  events: AdminEventRow[];
  users: EventFormUser[];
  isAdmin?: boolean;
};

export const EventsTable = ({ events, users, isAdmin }: Props) => {
  const columns = useMemo(
    (): ColumnDef<AdminEventRow>[] => [
      {
        accessorKey: 'restaurant',
        header: 'Restaurant',
        meta: { className: 'whitespace-normal' },
        cell: ({ row }) => (
          <div>
            {/* Upcoming dinners have no detail page yet. */}
            {row.original.isPast ? (
              <RestaurantLink id={row.original.id}>{row.original.restaurant}</RestaurantLink>
            ) : (
              <div className="font-medium">{row.original.restaurant}</div>
            )}
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
        accessorKey: 'pickerName',
        header: 'Auswahl',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => row.original.pickerName ?? '-',
      },
      {
        accessorKey: 'assignedUsers',
        header: 'Gäste',
        cell: ({ row }) => {
          const assignedUsers = row.original.assignedUsers;
          if (assignedUsers.length === 0) {
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
                assignedUserIds={event.assignedUsers.map((user) => user.id)}
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
    ],
    [users, isAdmin],
  );

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
