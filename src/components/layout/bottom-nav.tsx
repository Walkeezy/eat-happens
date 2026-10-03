'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/shadcn-utils';

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {bottomNavItems(isAdmin).map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <li key={label} className="flex-1">
              <NextLink
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors',
                  active && 'text-primary',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    active && 'bg-primary/10',
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
