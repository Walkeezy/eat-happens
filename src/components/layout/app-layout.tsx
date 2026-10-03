import NextLink from 'next/link';
import type { FC, PropsWithChildren } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Menu } from '@/components/layout/menu';
import { NavLinks } from '@/components/layout/nav-links';
import { Logo } from '@/components/logo';
import { verifySession } from '@/lib/verify-session';

export const AppLayout: FC<PropsWithChildren> = async ({ children }) => {
  // Cached per request, so this reuses the session the page itself already verified.
  const { user } = await verifySession();

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4 sm:px-6">
          <NextLink href="/" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="h-auto w-3.5" />
            </div>
            <span className="truncate text-sm font-semibold">Eat Happens</span>
          </NextLink>
          <NavLinks isAdmin={user.isAdmin} />
          <div className="ml-auto">
            <Menu user={user} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-10 md:pb-16">
        {children}
      </main>
      <BottomNav isAdmin={user.isAdmin} />
    </>
  );
};
