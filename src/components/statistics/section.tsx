import type { ReactNode } from 'react';

export function StatisticsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
