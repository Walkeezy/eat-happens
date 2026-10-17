'use client';

import { clsx } from 'clsx';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { headerNavItems } from '@/components/layout/nav-items';

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
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {label}
          </NextLink>
        );
      })}
    </nav>
  );
}
