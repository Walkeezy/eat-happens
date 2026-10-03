import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, eyebrow, description, actions }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 md:mb-8">
      <div className="min-w-0 space-y-1">
        {eyebrow ? <p className="text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
