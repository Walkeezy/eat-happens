import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn-utils';

type Props = {
  title: string;
  name: string;
  detail: string;
  icon?: ReactNode;
  href?: string;
  className?: string;
};

export function HighlightCard({ title, name, detail, icon, href, className }: Props) {
  const content = (
    <>
      {icon ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-base leading-snug font-bold">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
      {href ? <ChevronRight className="ml-auto size-4 shrink-0 self-center text-muted-foreground" aria-hidden /> : null}
    </>
  );
  const classes = cn('flex gap-3 rounded-xl border bg-card p-4 shadow-xs', className);

  return href ? (
    <NextLink href={href} className={cn(classes, 'transition-colors hover:border-primary/40')}>
      {content}
    </NextLink>
  ) : (
    <div className={classes}>{content}</div>
  );
}
