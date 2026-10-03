import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn-utils';

export const restaurantHref = (id: string) => `/restaurants/${id}`;

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
