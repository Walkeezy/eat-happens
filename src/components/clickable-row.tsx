'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { TableRow } from '@/components/shadcn/table';

/**
 * Makes a whole table row a click target. Keyboard, screen reader and cmd/middle-click users still need a real
 * link inside the row - this only widens the area a pointer can hit. It is the one client component a table
 * needs, so the cells themselves can render on the server.
 */
export function ClickableRow({ href, children }: { href: Route; children: ReactNode }) {
  const router = useRouter();

  const openRow = (event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || target.closest('a, button')) {
      return;
    }

    router.push(href);
  };

  return (
    <TableRow onClick={openRow} className="cursor-pointer">
      {children}
    </TableRow>
  );
}
