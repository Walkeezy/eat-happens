import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn-utils';

type Props = {
  title: string;
  name: string;
  detail: string;
  icon?: ReactNode;
  className?: string;
};

export function HighlightCard({ title, name, detail, icon, className }: Props) {
  return (
    <div className={cn('flex gap-3 rounded-xl border bg-card p-4 shadow-xs', className)}>
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
    </div>
  );
}
