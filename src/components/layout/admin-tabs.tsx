'use client';

import { clsx } from 'clsx';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/events', label: 'Events' },
  { href: '/users', label: 'Benutzer' },
] as const;

/** On phones the bottom bar has a single "Admin" tab, so the admin pages switch between each other here. */
export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="mb-4 grid grid-cols-2 gap-1 rounded-full border bg-card p-1 shadow-xs md:hidden">
      {tabs.map(({ href, label }) => {
        const active = pathname.startsWith(href);

        return (
          <NextLink
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'rounded-full py-1.5 text-center text-sm font-medium',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {label}
          </NextLink>
        );
      })}
    </nav>
  );
}
