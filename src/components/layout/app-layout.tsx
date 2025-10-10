import { Logo } from '@/components/logo';
import { UserDropdown } from '@/components/user-dropdown';
import { FC, PropsWithChildren } from 'react';

export const AppLayout: FC<PropsWithChildren> = async ({ children }) => (
  <>
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo className="h-auto w-3.5" />
          </div>
          <span className="truncate text-sm font-semibold">Eat Happens</span>
        </div>
        <div className="ml-auto">
          <UserDropdown />
        </div>
      </div>
    </header>
    <main className="container mx-auto flex min-h-svh w-full flex-1 flex-col px-3 py-4">{children}</main>
  </>
);
