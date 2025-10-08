import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/shadcn/sidebar';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { CSSProperties, FC, PropsWithChildren } from 'react';

export const SidebarLayout: FC<PropsWithChildren> = async ({ children }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, render children without sidebar (e.g., login page)
  if (!session) {
    return <>{children}</>;
  }

  // If logged in, render with sidebar
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 80)',
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between gap-2 px-4">
            <SidebarTrigger />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
