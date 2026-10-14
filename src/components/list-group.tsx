import { ChevronRight } from 'lucide-react';
import type { Route } from 'next';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { ListRowBody } from '@/components/list-row-body';
import { cn } from '@/lib/shadcn-utils';

/** An inset grouped list, the way native settings and list screens are built: one card, rows divided by hairlines. */
export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn('divide-y overflow-hidden rounded-xl border bg-card shadow-xs', className)}>{children}</ul>;
}

type RowProps = {
  /** Makes the whole row a link, with a chevron to say so. */
  href?: Route;
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
};

export function ListRow({ href, leading, title, subtitle, trailing }: RowProps) {
  const content = (
    <>
      {leading ? <div className="flex shrink-0 items-center">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {subtitle ? <div className="truncate text-xs text-muted-foreground">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-2 text-sm">{trailing}</div> : null}
      {href ? <ChevronRight className="-mr-1 size-4 shrink-0 text-muted-foreground/60" aria-hidden /> : null}
    </>
  );

  return (
    <li>
      {href ? (
        <NextLink href={href} className="block touch-manipulation select-none [-webkit-touch-callout:none]">
          <ListRowBody>{content}</ListRowBody>
        </NextLink>
      ) : (
        <div className="flex min-h-12 items-center gap-3 px-4 py-2.5">{content}</div>
      )}
    </li>
  );
}
