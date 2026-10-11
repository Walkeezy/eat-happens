'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, ViewTransition } from 'react';

/**
 * Animates between pages like a native app. Keying by path makes every route change an exit of the old page and
 * an enter of the new one; updates within a page (search params, server action refreshes) stay unanimated.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
