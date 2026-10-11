'use client';

import { UserCheck, UserX } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { setUserConfirmedAction } from '@/actions/users';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { type Column, Table } from '@/components/table';
import { getInitials } from '@/lib/user';

/** What the admin table needs per account - mapped on the server so the browser does not get whole user rows. */
export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAdmin: boolean;
  isConfirmed: boolean;
  /** Formatted on the server: a `Date` formatted in the browser would differ from the server's time zone during hydration. */
  registeredOn: string;
};

type Props = {
  users: AdminUserRow[];
  currentUserId: string;
};

export const UsersTable = ({ users, currentUserId }: Props) => {
  const [isPending, startTransition] = useTransition();

  const toggleConfirmation = (user: AdminUserRow) => {
    startTransition(async () => {
      // The action revalidates /users, so the table re-renders with the change in the same round trip.
      const result = await setUserConfirmedAction({ userId: user.id, isConfirmed: !user.isConfirmed });

      if (result.success) {
        toast.success(user.isConfirmed ? 'Bestätigung wurde entzogen' : 'Benutzer wurde bestätigt');
      } else {
        toast.error(result.error);
      }
    });
  };

  const columns: Column<AdminUserRow>[] = [
    {
      id: 'name',
      header: 'Benutzer',
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            src={user.image}
            fallback={getInitials(user.name)}
            className="size-8"
            fallbackClassName="bg-primary/15 text-xs font-semibold text-primary"
          />
          <div className="grid min-w-0">
            <span className="truncate font-medium">{user.name ?? '-'}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'registeredOn',
      header: 'Registriert am',
      className: 'hidden md:table-cell',
      cell: (user) => user.registeredOn,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={user.isConfirmed ? 'default' : 'secondary'}>{user.isConfirmed ? 'Bestätigt' : 'Ausstehend'}</Badge>
          {user.isAdmin ? <Badge variant="outline">Admin</Badge> : null}
        </div>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Aktionen</span>,
      className: 'text-right',
      cell: (user) =>
        user.id === currentUserId ? null : (
          <Button
            variant={user.isConfirmed ? 'outline' : 'default'}
            size="sm"
            disabled={isPending}
            onClick={() => toggleConfirmation(user)}
            aria-label={user.isConfirmed ? 'Bestätigung entziehen' : 'Bestätigen'}
          >
            {user.isConfirmed ? <UserX /> : <UserCheck />}
            <span className="hidden sm:inline">{user.isConfirmed ? 'Bestätigung entziehen' : 'Bestätigen'}</span>
          </Button>
        ),
    },
  ];

  return <Table rows={users} columns={columns} rowKey={(user) => user.id} />;
};
