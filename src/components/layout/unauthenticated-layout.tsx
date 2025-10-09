import { UtensilsCrossed } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';

export const UnauthenticatedLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <UtensilsCrossed className="size-4" />
        </div>
        <span className="truncate font-semibold text-foreground">Eat Happens</span>
      </div>
      {children}
    </div>
  </div>
);
