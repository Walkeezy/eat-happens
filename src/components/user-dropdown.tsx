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
import { authClient } from '@/lib/auth-client';
import { CalendarDays, Ellipsis, LogOut } from 'lucide-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export function UserDropdown() {
  const { data: session } = authClient.useSession();
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

  if (!session?.user) {
    return null;
  }

  const user = session.user as typeof session.user & { isAdmin: boolean; name: string | null };
  const userName = user.name || user.email || '';
  const userEmail = user.email || '';
  const userAvatar = user.image || '';
  const userInitials = getInitials(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 p-0">
          <Ellipsis className="h-4 w-4" />
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
              <NextLink href="/events" className="w-full cursor-pointer">
                <CalendarDays className="mr-2 h-4 w-4" />
                Events verwalten
              </NextLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <button onClick={handleLogout} className="w-full cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
