import type { ReactNode } from 'react';
import { BackButton } from '@/components/layout/back-button';
import { ScreenTitle } from '@/components/layout/screen-title';

type Props = {
  title: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Detail screens: a back link on desktop; on phones the bar already has one. */
  back?: boolean;
};

export function PageHeader({ title, eyebrow, description, actions, back }: Props) {
  return (
    <div className="mb-5 md:mb-8">
      {back ? <BackButton className="mb-2 hidden md:inline-flex" /> : null}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 space-y-1">
          {eyebrow ? <p className="text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</p> : null}
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <ScreenTitle title={title} />
          </div>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
