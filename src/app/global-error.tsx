'use client';

import '@/styles/globals.css';

/**
 * Last resort when even the root or app layout fails, e.g. the session lookup cannot reach the database.
 * It replaces the root layout, so it brings its own html and body.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="de" className="bg-muted text-foreground antialiased">
      <body className="flex min-h-svh items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 text-center shadow-xs">
          <h1 className="text-lg font-semibold">Da ist etwas schiefgelaufen</h1>
          <p className="text-sm text-muted-foreground">
            Eat Happens konnte nicht geladen werden. Versuch es gleich nochmals.
          </p>
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Nochmals versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
