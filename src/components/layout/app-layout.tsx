import NextLink from 'next/link';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { BackButton } from '@/components/layout/back-button';
import { BarTitle } from '@/components/layout/bar-title';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Menu } from '@/components/layout/menu';
import { NavLinks } from '@/components/layout/nav-links';
import { ShellProvider } from '@/components/layout/shell-context';
import { Logo } from '@/components/logo';
import { verifySession } from '@/lib/verify-session';

type ShellUser = { name: string | null; email: string; image?: string | null; isAdmin: boolean };

/**
 * The app chrome. On phones the top bar is a navigation bar: a back button on detail screens, the page title once
 * the large one has scrolled away, and the account menu. From `md` up it is the usual brand header with links.
 */
function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <ShellProvider>
      <header
        id="app-header"
        className="sticky top-0 z-50 bg-muted/85 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] backdrop-blur-lg transition-[background-color,border-color] duration-200 has-[[data-collapsed=true]]:border-b has-[[data-collapsed=true]]:bg-background/85 md:border-b md:bg-background/85"
      >
        <div className="relative mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4 sm:px-6">
          <BackButton className="inline-flex md:hidden" />
          <NextLink href="/" className="hidden items-center gap-2 md:flex">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="h-auto w-3.5" />
            </div>
            <span className="truncate text-sm font-semibold">Eat Happens</span>
          </NextLink>
          <NavLinks isAdmin={user.isAdmin} />
          <BarTitle />
          <div className="ml-auto">
            <Menu user={{ name: user.name, email: user.email, image: user.image }} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-[max(1.5rem,env(safe-area-inset-left),env(safe-area-inset-right))] md:pt-10 md:pb-16">
        {children}
      </main>
      <BottomNav isAdmin={user.isAdmin} />
    </ShellProvider>
  );
}

export const AppLayout: FC<PropsWithChildren> = async ({ children }) => {
  // Cached per request, so this reuses the session the page itself already verified.
  const { user } = await verifySession();

  return <AppShell user={user}>{children}</AppShell>;
};
