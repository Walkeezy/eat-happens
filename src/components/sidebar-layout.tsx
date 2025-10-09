import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/shadcn/sidebar';
import { auth } from '@/lib/auth';
import { UtensilsCrossed } from 'lucide-react';
import { headers } from 'next/headers';
import { FC, PropsWithChildren } from 'react';

export const SidebarLayout: FC<PropsWithChildren> = async ({ children }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, render children without sidebar (e.g., login page)
  if (!session) {
    return <>{children}</>;
  }

  // If logged in and confirmed, render with sidebar
  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Eat Happens</span>
          </div>
          <SidebarTrigger className="-mr-1 ml-auto rotate-180" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
      <AppSidebar side="right" />
    </SidebarProvider>
  );
};
