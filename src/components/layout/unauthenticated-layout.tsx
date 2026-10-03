import type { FC, PropsWithChildren } from 'react';
import { Logo } from '@/components/logo';

export const UnauthenticatedLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(130%_55%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%)] px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Logo className="h-auto w-7" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">Eat Happens</p>
          <p className="text-sm text-muted-foreground">Essen, bewerten, streiten.</p>
        </div>
      </div>
      {children}
    </div>
  </div>
);
