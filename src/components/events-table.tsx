'use client';

import { SquarePen } from 'lucide-react';
import { useMemo } from 'react';
import { AvatarStack } from '@/components/avatar-stack';
import { EventDialog } from '@/components/event-dialog';
import type { EventFormEvent, EventFormUser } from '@/components/event-form';
import { RestaurantLink } from '@/components/restaurant-link';
import { Button } from '@/components/shadcn/button';
import { type Column, Table } from '@/components/table';
import { formatCurrency } from '@/lib/format';

/** What the admin table needs per dinner - mapped on the server so the browser does not get every rating and user row. */
export type AdminEventRow = EventFormEvent & {
  /** Formatted on the server, so the table needs no date code in the browser. */
  displayDate: string;
  pickerName: string | null;
  /** Decided on the server, so the browser's time zone cannot disagree with it during hydration. */
  isPast: boolean;
  assignedUsers: { id: string; name: string | null; firstName: string | null; email: string; image: string | null }[];
};

type Props = {
  events: AdminEventRow[];
  users: EventFormUser[];
};

export const EventsTable = ({ events, users }: Props) => {
  const columns = useMemo(
    (): Column<AdminEventRow>[] => [
      {
        id: 'restaurant',
        header: 'Restaurant',
        className: 'whitespace-normal',
        cell: (row) => (
          <div>
            {/* Upcoming dinners have no detail page yet. */}
            {row.isPast ? (
              <RestaurantLink id={row.id}>{row.restaurant}</RestaurantLink>
            ) : (
              <div className="font-medium">{row.restaurant}</div>
            )}
            <div className="text-xs text-muted-foreground md:hidden">{row.displayDate}</div>
          </div>
        ),
      },
      {
        id: 'date',
        header: 'Datum',
        className: 'hidden md:table-cell',
        cell: (row) => row.displayDate,
      },
      {
        id: 'totalCost',
        header: 'Gesamtkosten',
        className: 'hidden md:table-cell',
        cell: (row) => formatCurrency(row.totalCost),
      },
      {
        id: 'pickerName',
        header: 'Auswahl',
        className: 'hidden md:table-cell',
        cell: (row) => row.pickerName ?? '-',
      },
      {
        id: 'assignedUsers',
        header: 'Gäste',
        cell: (row) =>
          row.assignedUsers.length === 0 ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            <AvatarStack users={row.assignedUsers} max={4} />
          ),
      },
      {
        id: 'actions',
        header: <span className="sr-only">Aktionen</span>,
        className: 'text-right',
        cell: (row) => (
          <EventDialog
            mode="edit"
            event={row}
            users={users}
            assignedUserIds={row.assignedUsers.map((user) => user.id)}
            trigger={
              <Button variant="outline" size="sm" aria-label={`${row.restaurant} bearbeiten`}>
                <SquarePen />
                <span className="hidden sm:inline">Bearbeiten</span>
              </Button>
            }
          />
        ),
      },
    ],
    [users],
  );

  return <Table rows={events} columns={columns} rowKey={(row) => row.id} />;
};
