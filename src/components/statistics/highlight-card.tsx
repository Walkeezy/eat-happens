import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn-utils';

type Props = {
  title: string;
  name: string;
  detail: string;
  icon?: ReactNode;
  variant?: 'default' | 'hero';
  className?: string;
};

export function HighlightCard({ title, name, detail, icon, variant = 'default', className }: Props) {
  const isHero = variant === 'hero';

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4 shadow-xs',
        isHero ? 'border-transparent bg-linear-to-br from-primary to-primary/75 text-primary-foreground' : 'bg-card',
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-5',
            isHero ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary',
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className={cn('text-xs font-medium', isHero ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{title}</p>
        <p className={cn('leading-snug font-bold', isHero ? 'mt-0.5 text-xl' : 'text-base')}>{name}</p>
        <p className={cn('mt-1 text-sm', isHero ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{detail}</p>
      </div>
    </div>
  );
}
