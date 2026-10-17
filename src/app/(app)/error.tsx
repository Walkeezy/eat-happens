'use client';

import { TriangleAlert } from 'lucide-react';

/**
 * Shown inside the app layout when a page fails to render, e.g. while the database is unreachable.
 * Styled by hand like the global error page: the boundary ships with every page, and the shadcn Empty and Button
 * would bring class-variance-authority and tailwind-merge into every first load for a screen that is rarely seen.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mt-8 flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <div className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <TriangleAlert className="size-6" />
        </div>
        <div className="text-lg font-medium tracking-tight">Da ist etwas schiefgelaufen</div>
        <div className="text-sm/relaxed text-muted-foreground">
          Die Seite konnte nicht geladen werden. Versuch es gleich nochmals.
        </div>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-9 touch-manipulation items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] pointer-coarse:h-11"
      >
        Nochmals versuchen
      </button>
    </div>
  );
}
