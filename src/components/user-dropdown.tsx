'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { Skeleton } from '@/components/shadcn/skeleton';
import { authClient } from '@/lib/auth-client';
import { CalendarDays, Ellipsis, LogOut } from 'lucide-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export function UserDropdown() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          router.refresh();
        },
      },
    });
  };

  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as typeof session.user & { isAdmin: boolean };
  const userName = user.name || 'User';
  const userEmail = user.email || '';
  const userAvatar = user.image || '';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{userName}</span>
            <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        {user.isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <NextLink href="/events">
                <CalendarDays className="mr-2 h-4 w-4" />
                Events verwalten
              </NextLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <button onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
