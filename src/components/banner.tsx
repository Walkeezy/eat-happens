import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/lib/shadcn-utils';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  variant?: 'default' | 'highlight';
};

export function Banner({ icon, title, description, action, onDismiss, variant = 'default' }: Props) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center',
        variant === 'highlight' ? 'border-primary/20 bg-primary/8' : 'bg-card',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div className={cn('min-w-0', onDismiss && 'pr-8 sm:pr-0')}>
          <p className="leading-snug font-semibold">{title}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div> : null}
      {onDismiss ? (
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={onDismiss}
          aria-label="Hinweis schliessen"
          className="absolute top-2 right-2 sm:static"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}

/** Round tinted icon used as the leading visual of a banner. */
export function BannerIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary [&_svg]:size-5">
      {children}
    </div>
  );
}
