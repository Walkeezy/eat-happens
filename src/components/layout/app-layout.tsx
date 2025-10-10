import { Logo } from '@/components/logo';
import { UserDropdown } from '@/components/user-dropdown';
import { FC, PropsWithChildren } from 'react';

export const AppLayout: FC<PropsWithChildren> = async ({ children }) => (
  <div className="min-h-screen">
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo className="h-auto w-3.75" />
          </div>
          <span className="truncate font-semibold">Eat Happens</span>
        </div>
        <div className="ml-auto">
          <UserDropdown />
        </div>
      </div>
    </header>
    <main className="flex flex-1 flex-col">{children}</main>
  </div>
);
