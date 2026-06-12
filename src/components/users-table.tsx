'use client';

import { setUserConfirmedAction } from '@/actions/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { Table } from '@/components/table';
import { dayjs } from '@/lib/dayjs';
import { getInitials } from '@/lib/user';
import type { User } from '@/types/events';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { UserCheck, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

type Props = {
  users: User[];
  currentUserId: string;
};

export const UsersTable = ({ users, currentUserId }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleConfirmation = (user: User) => {
    startTransition(async () => {
      try {
        await setUserConfirmedAction({ userId: user.id, isConfirmed: !user.isConfirmed });
        toast.success(user.isConfirmed ? 'Bestätigung wurde entzogen' : 'Benutzer wurde bestätigt');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Benutzer konnte nicht aktualisiert werden');
      }
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Benutzer',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? ''} alt={user.name ?? user.email} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid">
              <span className="font-medium">{user.name ?? '-'}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Registriert am',
      cell: ({ row }) => dayjs(row.original.createdAt).format('D. MMMM YYYY'),
    },
    {
      accessorKey: 'isConfirmed',
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex gap-1">
            <Badge variant={user.isConfirmed ? 'default' : 'secondary'}>
              {user.isConfirmed ? 'Bestätigt' : 'Ausstehend'}
            </Badge>
            {user.isAdmin && <Badge variant="outline">Admin</Badge>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => {
        const user = row.original;
        if (user.id === currentUserId) {
          return null;
        }

        return (
          <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleToggleConfirmation(user)}>
            {user.isConfirmed ? (
              <>
                <UserX />
                Bestätigung entziehen
              </>
            ) : (
              <>
                <UserCheck />
                Bestätigen
              </>
            )}
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} columns={columns} />;
};
