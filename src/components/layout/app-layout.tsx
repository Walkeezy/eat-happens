import { Menu } from '@/components/layout/menu';
import { Logo } from '@/components/logo';
import NextLink from 'next/link';
import { FC, PropsWithChildren } from 'react';

export const AppLayout: FC<PropsWithChildren> = async ({ children }) => (
  <>
    <header className="fixed top-0 right-0 left-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background">
      <div className="container mx-auto flex items-center gap-2 px-5">
        <NextLink href="/" className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo className="h-auto w-3.5" />
          </div>
          <span className="truncate text-sm font-semibold">Eat Happens</span>
        </NextLink>
        <div className="ml-auto">
          <Menu />
        </div>
      </div>
    </header>
    <main className="container mx-auto flex min-h-svh w-full flex-1 flex-col px-5 py-20">{children}</main>
  </>
);
