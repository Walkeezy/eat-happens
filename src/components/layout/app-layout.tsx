import { UserDropdown } from '@/components/user-dropdown';
import { UtensilsCrossed } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-background">
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <UtensilsCrossed className="size-4" />
        </div>
        <span className="truncate font-semibold">Eat Happens</span>
      </div>
      <div className="ml-auto">
        <UserDropdown />
      </div>
    </header>
    <main className="flex flex-1 flex-col bg-muted">{children}</main>
  </div>
);
