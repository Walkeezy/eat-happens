'use client';

import { useLinkStatus } from 'next/link';
import type { ReactNode } from 'react';

/** Dims the row until the next page commits, so a tap is acknowledged even while the page is still loading. */
export function ListRowBody({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <div
      data-pending={pending || undefined}
      className="flex min-h-12 items-center gap-3 px-4 py-2.5 transition-[background-color,opacity] active:bg-muted data-pending:opacity-60"
    >
      {children}
    </div>
  );
}
