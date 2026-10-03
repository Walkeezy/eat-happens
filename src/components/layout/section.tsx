import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ title, badge, action, children }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {badge}
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
