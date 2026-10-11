import type { Route } from 'next';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn-utils';

// The id is dynamic, so the typed-routes check cannot see the literal; `/restaurants/[id]` is a real route.
export const restaurantHref = (id: string) => `/restaurants/${id}` as Route;

/** A visible underline, so the link reads as one on touch screens where there is no hover. */
export function RestaurantLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <NextLink
      href={restaurantHref(id)}
      className={cn(
        'font-medium underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:decoration-current',
        className,
      )}
    >
      {children}
    </NextLink>
  );
}
