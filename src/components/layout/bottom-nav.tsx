'use client';

import type { LucideIcon } from 'lucide-react';
import NextLink, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { bottomNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/shadcn-utils';

/** Lights up as soon as the tab is tapped, so the bar reacts before the next page has rendered. */
function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={cn(
        'flex h-7 w-12 items-center justify-center rounded-full transition-[background-color,scale] duration-150 group-active:scale-90 group-active:bg-primary/10',
        (active || pending) && 'bg-primary/10',
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  // Tapping the tab you are already on scrolls back to the top, like a native tab bar.
  const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.pathname === pathname) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/85 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {bottomNavItems(isAdmin).map(({ href, label, icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <li key={label} className="flex-1">
              <NextLink
                href={href}
                onClick={scrollToTop}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex h-16 touch-manipulation flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors',
                  active && 'text-primary',
                )}
              >
                <TabIcon icon={icon} active={active} />
                {label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
