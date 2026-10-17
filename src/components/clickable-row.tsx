'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { type MouseEvent, type ReactNode, useTransition } from 'react';

/**
 * Makes a whole table row a click target. Keyboard, screen reader and cmd/middle-click users still need a real
 * link inside the row - this only widens the area a pointer can hit. It is the one client component a table
 * needs, so the cells themselves can render on the server.
 */
export function ClickableRow({ href, children }: { href: Route; children: ReactNode }) {
  const router = useRouter();
  // Dims the row until the next page commits, so a tap is acknowledged even while the page is still loading.
  const [isPending, startTransition] = useTransition();

  const openRow = (event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || target.closest('a, button')) {
      return;
    }

    startTransition(() => router.push(href));
  };

  // The shadcn TableRow's classes plus the pointer ones, written out: going through TableRow would pull
  // tailwind-merge into the first load of every page with a table, for a merge whose result is this one string.
  return (
    <tr
      data-slot="table-row"
      onClick={openRow}
      data-pending={isPending || undefined}
      className="cursor-pointer border-b transition-[background-color,opacity] hover:bg-muted/50 active:bg-muted data-pending:opacity-60"
    >
      {children}
    </tr>
  );
}
