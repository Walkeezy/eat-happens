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
import { getInitials } from '@/lib/user';
import { CalendarDays, ChartNoAxesCombined, Ellipsis, LogOut, Trophy } from 'lucide-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export function Menu() {
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

  const user = session.user as typeof session.user & { isAdmin: boolean };

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
            <AvatarImage src={user.image || ''} alt={user.name || user.email || ''} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name || user.email || ''}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email || ''}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <NextLink href="/ranking" className="w-full cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            Rangliste
          </NextLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NextLink href="/statistics" className="w-full cursor-pointer">
            <ChartNoAxesCombined className="mr-2 h-4 w-4" />
            Statistik
          </NextLink>
        </DropdownMenuItem>
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
