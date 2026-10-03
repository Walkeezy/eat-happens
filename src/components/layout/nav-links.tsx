'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { headerNavItems } from '@/components/layout/nav-items';
import { cn } from '@/lib/shadcn-utils';

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 md:flex">
      {headerNavItems(isAdmin).map(({ href, label, isActive }) => {
        const active = isActive(pathname);

        return (
          <NextLink
            key={label}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            )}
          >
            {label}
          </NextLink>
        );
      })}
    </nav>
  );
}
