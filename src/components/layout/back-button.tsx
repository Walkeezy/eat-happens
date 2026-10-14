'use client';

import { ChevronLeft } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { parentScreen, screenFor } from '@/components/layout/nav-items';
import { useShell } from '@/components/layout/shell-context';
import { cn } from '@/lib/shadcn-utils';

/**
 * Leads back to the screen a detail page was opened from. Within the app it goes back in history, so scroll
 * position and the previous tab survive; on a deep link it is a plain link to the parent tab.
 */
export function BackButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canGoBack, previousPathname, collapsed } = useShell();
  const parent = parentScreen(pathname);
  if (!parent) {
    return null;
  }

  const origin = canGoBack && previousPathname !== undefined ? screenFor(previousPathname) : undefined;
  const target = origin ?? parent;

  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (canGoBack && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <NextLink
      href={target.href}
      onClick={goBack}
      className={cn(
        '-ml-2 inline-flex h-10 touch-manipulation items-center gap-0.5 rounded-full pr-3 pl-1 text-sm font-medium text-primary transition-[background-color,scale] active:scale-95 active:bg-primary/10',
        className,
      )}
    >
      <ChevronLeft className="size-6" aria-hidden />
      {/* Once the bar shows the page title, only the chevron stays so the two never collide. */}
      <span className={cn('transition-opacity duration-200', collapsed && 'sr-only')}>{target.label}</span>
    </NextLink>
  );
}
