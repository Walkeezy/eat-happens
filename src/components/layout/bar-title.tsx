'use client';

import { clsx } from 'clsx';
import { useShell } from '@/components/layout/shell-context';

/** The page title, shown in the mobile bar once the large title has scrolled underneath it. */
export function BarTitle() {
  const { title, collapsed } = useShell();

  return (
    <div
      aria-hidden
      data-collapsed={collapsed ? 'true' : 'false'}
      className={clsx(
        'pointer-events-none absolute inset-x-20 inset-y-0 flex items-center justify-center transition-[opacity,translate] duration-200 md:hidden',
        collapsed ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
      )}
    >
      <span className="truncate text-base font-semibold">{title}</span>
    </div>
  );
}
